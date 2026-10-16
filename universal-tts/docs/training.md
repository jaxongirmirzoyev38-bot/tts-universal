# Universal TTS Training & Distributed Recipes

Universal TTS trains across 4 decoupled modular stages for maximum efficiency and stability.

## Training Stages

### Stage 1: Speaker Encoder (ECAPA-TDNN)
- **Dataset:** VoxCeleb1 + VoxCeleb2 + Emilia (10,000+ speakers)
- **Loss:** Additive Angular Margin Softmax (AAM-Softmax, margin=0.2, scale=30)
- **Epochs:** 100, Batch Size: 256
- **Result:** Robust 512-dimensional speaker embeddings invariant to channel noise.

### Stage 2: Flow-Matching DiT (Acoustic Backbone)
- **Model:** 16-layer Diffusion Transformer (768 hidden, 12 heads, adaLN-Zero)
- **Objective:** Optimal Transport Conditional Flow Matching (OT-CFM)
- **Loss:** $L_{CFM} = \mathbb{E}_{t, x_0, x_1} [ \| v_\theta(x_t, t, c) - (x_1 - (1 - \sigma_{min})x_0) \|_2^2 ]$
- **Hardware:** 8x NVIDIA H100 with DeepSpeed ZeRO-2 and bfloat16.

### Stage 3: Vocoder (HiFi-GAN / BigVGAN v2)
- **Objective:** Multi-Period Discriminator (MPD) + Multi-Scale Discriminator (MSD)
- **Audio:** 24,000 Hz, 80-channel mel-spectrogram.

### Stage 4: Voice Adaptation & LoRA
- Parameter-efficient fine-tuning on custom voices with Rank=16, Alpha=32.
