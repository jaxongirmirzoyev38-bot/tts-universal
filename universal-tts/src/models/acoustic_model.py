"""
Acoustic Model: Diffusion Transformer (DiT) with Factorized Latent Diffusion
Backbone for Universal TTS predicting mel-spectrogram trajectories.
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F


class SinusoidalPosEmb(nn.Module):
    """Sinusoidal timestep embedding."""
    def __init__(self, dim: int):
        super().__init__()
        self.dim = dim

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        half_dim = self.dim // 2
        emb = math.log(10000) / (half_dim - 1)
        emb = torch.exp(torch.arange(half_dim, device=x.device) * -emb)
        emb = x[:, None] * emb[None, :]
        return torch.cat((emb.sin(), emb.cos()), dim=-1)


class DiTBlock(nn.Module):
    """Diffusion Transformer block with adaptive LayerNorm (adaLN-Zero)."""
    def __init__(self, hidden_size: int, num_heads: int):
        super().__init__()
        self.norm1 = nn.LayerNorm(hidden_size, elementwise_affine=False)
        self.attn = nn.MultiheadAttention(hidden_size, num_heads, batch_first=True)
        self.norm2 = nn.LayerNorm(hidden_size, elementwise_affine=False)
        self.mlp = nn.Sequential(
            nn.Linear(hidden_size, hidden_size * 4),
            nn.GELU(),
            nn.Linear(hidden_size * 4, hidden_size),
        )
        # Conditioning modulation: scale, shift, gate for attn and mlp
        self.adaLN_modulation = nn.Sequential(
            nn.SiLU(),
            nn.Linear(hidden_size, 6 * hidden_size)
        )

    def forward(self, x: torch.Tensor, c: torch.Tensor) -> torch.Tensor:
        # c is the merged conditioning embedding
        shift_msa, scale_msa, gate_msa, shift_mlp, scale_mlp, gate_mlp = self.adaLN_modulation(c).chunk(6, dim=-1)
        
        # Attention with adaptive scale & shift
        norm_x = self.norm1(x) * (1 + scale_msa.unsqueeze(1)) + shift_msa.unsqueeze(1)
        attn_out, _ = self.attn(norm_x, norm_x, norm_x)
        x = x + gate_msa.unsqueeze(1) * attn_out

        # MLP with adaptive scale & shift
        norm_x = self.norm2(x) * (1 + scale_mlp.unsqueeze(1)) + shift_mlp.unsqueeze(1)
        mlp_out = self.mlp(norm_x)
        x = x + gate_mlp.unsqueeze(1) * mlp_out
        return x


class AcousticDiT(nn.Module):
    """
    450M-parameter Diffusion Transformer for Multilingual Mel Generation.
    """
    def __init__(
        self,
        in_channels: int = 80,
        hidden_size: int = 768,
        num_layers: int = 16,
        num_heads: int = 12,
        speaker_dim: int = 512,
        text_dim: int = 512
    ):
        super().__init__()
        self.in_proj = nn.Linear(in_channels, hidden_size)
        self.time_embed = nn.Sequential(
            SinusoidalPosEmb(hidden_size),
            nn.Linear(hidden_size, hidden_size),
            nn.SiLU(),
            nn.Linear(hidden_size, hidden_size)
        )
        self.spk_proj = nn.Linear(speaker_dim, hidden_size)
        self.text_proj = nn.Linear(text_dim, hidden_size)

        self.blocks = nn.ModuleList([
            DiTBlock(hidden_size, num_heads) for _ in range(num_layers)
        ])
        
        self.final_norm = nn.LayerNorm(hidden_size)
        self.out_proj = nn.Linear(hidden_size, in_channels)

    def forward(
        self,
        xt: torch.Tensor,
        t: torch.Tensor,
        text_cond: torch.Tensor,
        speaker_emb: torch.Tensor
    ) -> torch.Tensor:
        """
        xt: [Batch, Mel_dim=80, Time]
        t: [Batch]
        text_cond: [Batch, Time, Text_dim]
        speaker_emb: [Batch, Spk_dim]
        """
        # Transpose xt to [Batch, Time, Mel_dim]
        h = self.in_proj(xt.transpose(1, 2))
        t_emb = self.time_embed(t)
        spk_emb = self.spk_proj(speaker_emb)
        cond = t_emb + spk_emb

        # Cross conditioning
        text_feat = self.text_proj(text_cond)
        if text_feat.shape[1] < h.shape[1]:
            # Interpolate or pad text conditioning to target frame length
            text_feat = F.interpolate(text_feat.transpose(1, 2), size=h.shape[1], mode='linear').transpose(1, 2)
        h = h + text_feat[:, :h.shape[1], :]

        for block in self.blocks:
            h = block(h, cond)

        h = self.final_norm(h)
        vt = self.out_proj(h).transpose(1, 2)
        return vt
