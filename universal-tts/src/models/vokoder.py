"""
HiFi-GAN / BigVGAN Vocoder Generator
Converts 80-channel mel-spectrograms into high-fidelity 24kHz audio waveforms.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class ResBlock(nn.Module):
    """Residual block with dilated 1D convolutions."""
    def __init__(self, channels: int, kernel_size: int = 3, dilations: tuple = (1, 3, 5)):
        super().__init__()
        self.convs1 = nn.ModuleList([
            nn.Conv1d(channels, channels, kernel_size, dilation=d, padding=((kernel_size - 1) * d) // 2)
            for d in dilations
        ])
        self.convs2 = nn.ModuleList([
            nn.Conv1d(channels, channels, kernel_size, dilation=1, padding=(kernel_size - 1) // 2)
            for _ in dilations
        ])

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        for c1, c2 in zip(self.convs1, self.convs2):
            xt = F.leaky_relu(x, 0.1)
            xt = c1(xt)
            xt = F.leaky_relu(xt, 0.1)
            xt = c2(xt)
            x = x + xt
        return x


class HiFiGANGenerator(nn.Module):
    """
    HiFi-GAN neural vocoder for high fidelity 24kHz audio synthesis.
    """
    def __init__(
        self,
        in_channels: int = 80,
        upsample_rates: tuple = (8, 8, 2, 2),
        upsample_kernel_sizes: tuple = (16, 16, 4, 4),
        upsample_initial_channel: int = 512,
        resblock_kernel_sizes: tuple = (3, 7, 11),
        resblock_dilation_sizes: tuple = ((1, 3, 5), (1, 3, 5), (1, 3, 5))
    ):
        super().__init__()
        self.conv_pre = nn.Conv1d(in_channels, upsample_initial_channel, 7, 1, padding=3)

        self.ups = nn.ModuleList()
        curr_channels = upsample_initial_channel
        for rate, k_size in zip(upsample_rates, upsample_kernel_sizes):
            self.ups.append(
                nn.ConvTranspose1d(
                    curr_channels,
                    curr_channels // 2,
                    k_size,
                    stride=rate,
                    padding=(k_size - rate) // 2
                )
            )
            curr_channels //= 2

        self.resblocks = nn.ModuleList([
            ResBlock(curr_channels, k, d)
            for k, d in zip(resblock_kernel_sizes, resblock_dilation_sizes)
        ])

        self.conv_post = nn.Conv1d(curr_channels, 1, 7, 1, padding=3)

    def forward(self, mel: torch.Tensor) -> torch.Tensor:
        """
        mel: [Batch, 80, Time]
        Returns: [Batch, 1, Time * 256] raw waveform (-1.0 to 1.0)
        """
        x = self.conv_pre(mel)
        for up in self.ups:
            x = F.leaky_relu(x, 0.1)
            x = up(x)

        xs = 0
        for block in self.resblocks:
            xs = xs + block(x)
        x = xs / len(self.resblocks)

        x = F.leaky_relu(x, 0.1)
        wav = torch.tanh(self.conv_post(x))
        return wav
