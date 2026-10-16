# Voice Cloning: 3-Tier Architecture Guide

Universal TTS offers 3 complementary voice cloning workflows depending on reference data availability and fidelity requirements:

## Method 1: Zero-Shot Cloning (Instant)
- **Reference Required:** 3 to 10 seconds of clear speech without background noise.
- **Mechanism:** ECAPA-TDNN computes instantaneous 512-dim speaker vector.
- **Pros:** Instantaneous (< 0.2s), no fine-tuning required.
- **Ideal For:** Dynamic voice assistants, character dubbing, real-time gaming.

## Method 2: Few-Shot Cloning (LoRA)
- **Reference Required:** 1 to 5 minutes of speech (10-20 sentences).
- **Mechanism:** Low-Rank Adaptation (LoRA) applied to DiT linear projections (`q, k, v, out`).
- **Training Time:** ~3 minutes on single RTX 4090 (800 iterations).
- **Pros:** Preserves subtle vocal mannerisms and idiosyncratic phonology.

## Method 3: Full Fine-Tune (Studio Quality)
- **Reference Required:** 30+ minutes of studio-grade WAV recordings with transcriptions.
- **Mechanism:** End-to-end checkpoint training of acoustic DiT and vocoder.
- **Target:** Commercial audiobooks, celebrity brand ambassadors, virtual popstars.
