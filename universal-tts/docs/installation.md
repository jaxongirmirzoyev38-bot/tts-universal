# Universal TTS Installation Guide

## System Requirements
- OS: Ubuntu 22.04 LTS / Linux / macOS (Apple Silicon) / Windows 11 (WSL2)
- Python: 3.11 or 3.12
- GPU: NVIDIA GPU with >= 8GB VRAM (CUDA 12.1+ recommended) or Apple Metal (MPS)
- RAM: 16 GB minimum

## Step-by-Step Installation

### 1. Clone the repository
```bash
git clone https://github.com/universal-tts/universal-tts.git
cd universal-tts
```

### 2. Create and activate a Virtual Environment
```bash
python3.11 -m venv venv
source venv/bin/activate
```

### 3. Install PyTorch with CUDA
```bash
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
pip install -e .
```

### 5. Verify Installation
```bash
python -c "import universal_tts; print(universal_tts.__version__)"
pytest tests/
```
