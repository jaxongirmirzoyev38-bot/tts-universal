"""
ECAPA-TDNN Speaker Encoder for Zero-Shot Voice Cloning
Extracts a 512-dimensional speaker embedding vector from 3-10s audio.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class SqueezeExcitation(nn.Module):
    """Channel attention squeeze and excitation block."""
    def __init__(self, channels: int, reduction: int = 4):
        super().__init__()
        self.fc1 = nn.Linear(channels, channels // reduction)
        self.fc2 = nn.Linear(channels // reduction, channels)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [B, C, T]
        mean = x.mean(dim=-1)
        s = F.relu(self.fc1(mean))
        s = torch.sigmoid(self.fc2(s)).unsqueeze(-1)
        return x * s


class Conv1dReluBn(nn.Module):
    """1D Convolution + BatchNorm + ReLU with dilation support."""
    def __init__(self, in_channels: int, out_channels: int, kernel_size: int = 1, stride: int = 1, padding: int = 0, dilation: int = 1):
        super().__init__()
        self.conv = nn.Conv1d(in_channels, out_channels, kernel_size, stride, padding, dilation)
        self.bn = nn.BatchNorm1d(out_channels)
        self.relu = nn.ReLU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.relu(self.bn(self.conv(x)))


class ECAPATDNN(nn.Module):
    """
    ECAPA-TDNN neural network for robust speaker verification & zero-shot cloning.
    """
    def __init__(self, in_channels: int = 80, channels: int = 512, emb_dim: int = 512):
        super().__init__()
        self.layer1 = Conv1dReluBn(in_channels, channels, kernel_size=5, padding=2)
        self.layer2 = Conv1dReluBn(channels, channels, kernel_size=3, padding=2, dilation=2)
        self.layer3 = Conv1dReluBn(channels, channels, kernel_size=3, padding=3, dilation=3)
        self.layer4 = Conv1dReluBn(channels, channels, kernel_size=3, padding=4, dilation=4)
        
        # Multi-layer feature aggregation
        self.mfa = nn.Conv1d(channels * 3, channels * 3, kernel_size=1)
        self.se = SqueezeExcitation(channels * 3)
        
        # Attentive statistical pooling
        self.pool_att = nn.Conv1d(channels * 3, 1, kernel_size=1)
        self.fc = nn.Linear(channels * 3 * 2, emb_dim)
        self.bn = nn.BatchNorm1d(emb_dim)

    def forward(self, mel: torch.Tensor) -> torch.Tensor:
        """
        Forward pass.
        mel: [Batch, Mel_dim=80, Time]
        Returns: L2-normalized speaker embedding [Batch, 512]
        """
        x1 = self.layer1(mel)
        x2 = self.layer2(x1)
        x3 = self.layer3(x2)
        x4 = self.layer4(x3)

        cat = torch.cat([x2, x3, x4], dim=1)
        cat = self.se(self.mfa(cat))

        # Attentive pooling
        alpha = torch.softmax(self.pool_att(cat), dim=-1)
        mean = torch.sum(alpha * cat, dim=-1)
        var = torch.sum(alpha * (cat ** 2), dim=-1) - (mean ** 2)
        std = torch.sqrt(torch.clamp(var, min=1e-8))

        stat = torch.cat([mean, std], dim=-1)
        emb = self.bn(self.fc(stat))
        # L2 normalize
        return F.normalize(emb, p=2, dim=-1)
