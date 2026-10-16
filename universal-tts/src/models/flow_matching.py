"""
Optimal Transport Conditional Flow Matching (OT-CFM) Module
Vector field regression for high-speed acoustic generation with Euler integration.
"""

import torch
import torch.nn as nn
from typing import Tuple


class OptimalTransportFlowMatching:
    """
    Continuous-time Optimal Transport Flow Matching (OT-CFM).
    Interpolates straight line paths between Gaussian noise x0 and target mel x1.
    """
    def __init__(self, sigma_min: float = 1e-4):
        self.sigma_min = sigma_min

    def sample_location_and_conditional_flow(
        self, x0: torch.Tensor, x1: torch.Tensor, t: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Calculates xt = (1 - (1 - sigma_min)*t) * x0 + t * x1
        and target velocity vt = d(xt)/dt = x1 - (1 - sigma_min) * x0
        """
        # t: [Batch, 1, 1]
        t = t.view(-1, 1, 1)
        mu_t = t * x1
        sigma_t = 1 - (1 - self.sigma_min) * t
        xt = mu_t + sigma_t * x0
        ut = x1 - (1 - self.sigma_min) * x0
        return xt, ut

    @torch.no_grad()
    def solve_euler(
        self,
        model: nn.Module,
        x0: torch.Tensor,
        cond: torch.Tensor,
        speaker_emb: torch.Tensor,
        steps: int = 32,
        cfg_scale: float = 1.8
    ) -> torch.Tensor:
        """
        Euler ODE solver for fast inference.
        """
        dt = 1.0 / steps
        xt = x0
        for i in range(steps):
            t_val = i / steps
            t = torch.full((x0.shape[0],), t_val, device=x0.device, dtype=x0.dtype)
            
            # Predict velocity field
            vt = model(xt, t, cond, speaker_emb)
            
            if cfg_scale > 1.0:
                # Classifier-Free Guidance
                null_speaker = torch.zeros_like(speaker_emb)
                vt_uncond = model(xt, t, cond, null_speaker)
                vt = vt_uncond + cfg_scale * (vt - vt_uncond)
                
            xt = xt + vt * dt
            
        return xt
