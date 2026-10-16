# 🌐 Universal TTS: Dunyo Tillarining Universal Ochiq Kodli Ovoz Tizimi

[![Litsenziya: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-brightgreen.svg)](https://www.python.org/downloads/)
[![PyTorch 2.3+](https://img.shields.io/badge/PyTorch-2.3+-ee4c2c.svg)](https://pytorch.org/)
[![Benchmarks](https://img.shields.io/badge/Arena%20Ball-1240-orange)](https://github.com/universal-tts/universal-tts)

> **Universal TTS** — dunyodagi 7000+ tilni Unicode yozuvidan boshlab o'rganadigan, ElevenLabs v3 dan tezroq va sifatliroq, ochiq kodli matndan nutq sintezlash (Text-to-Speech) tizimi. Loyiha Flow-Matching Diffusion Transformers (DiT), ECAPA-TDNN spiker embeddinglari va HiFi-GAN vokoderlaridan foydalanadi.

---

## 🎯 Asosiy Imkoniyatlar

1. **7000+ Tilni Bosqichma-bosqich Qo'llab-quvvatlash**:
   - 1-bosqich: O'zbek tili (Lotin va Kirill), Turk, Qozoq, Rus, Arab, Fors, Ingliz.
   - Har bir til Unicode alifbosidan boshlab fonetikaga o'giriladi (G2P).
   - Universal Romanizatsiya: Barcha yozuv tizimlarini (Arab, Kirill, Hangul, Devanagari) yagona standartga keltirish.
2. **Ovoz Klonlashning 3 Xil Usuli**:
   - **1-usul (Zero-shot):** 3-10 soniya audiodan ovoz tembrini ajratib olib darhol gapirtirish.
   - **2-usul (Few-shot):** 1-5 daqiqalik audiodan LoRA (Low-Rank Adaptation) orqali aniq moslashtirish.
   - **3-usul (Full fine-tune):** 30+ daqiqalik studiya audiosi bilan brend va diktor ovozini to'liq yaratish.
3. **Emotsiya va Prosodiya Boshqaruvi**:
   - Quvnoq, jiddiy/rasmiy, g'amgin, shovqinli/energetik, pichirlash (whisper).
   - Nafas olish (`<breath>`), kulgi (`<laugh>`) va jonli reaktsiyalar (`|ha|`, `|mhm|`).
4. **Yuqori Unumdorlik**:
   - Real-Time Factor (RTF) < 0.25 (1 soniyalik nutq 0.2 soniyada sintezlanadi).
   - 24,000 Hz va 44,100 Hz kristaldek toza audio sifati.

---

## 🚀 Tezkor Boshlash

### O'rnatish

```bash
git clone https://github.com/universal-tts/universal-tts.git
cd universal-tts
pip install -r requirements.txt
pip install -e .
```

### Python orqali ishlatish (3 qator kod)

```python
import universal_tts

# Modelni ishga tushirish
tts = universal_tts.Synthesizer(language="uz", device="cuda")

# Nutq sintez qilish
audio = tts.synthesize(
    text="Assalomu alaykum! Universal TTS tizimi O'zbek tilida tabiiy gapiradi.",
    voice="male_01",
    emotion="cheerful"
)

# WAV formatida saqlash
audio.save("salom.wav")
```

### Ovozni 5 soniyada klonlash (Zero-Shot)

```python
cloned = tts.clone_voice(
    reference_audio="mening_ovozim.wav",
    text="Ushbu audio mening o'z ovozimda sun'iy intellekt orqali aytildi.",
    language="uz"
)
cloned.save("klonlangan_audio.wav")
```

---

## 🏗️ Arxitektura Tarkibi

- **Text Encoder:** Unicode normalizatori va ko'p tilli Transformer.
- **G2P (Grapheme-to-Phoneme):** O'zbek tili uchun o', g', sh, ch digraflarini to'g'ri talaffuz qiluvchi IPA tizimi.
- **Speaker Encoder:** ECAPA-TDNN arxitekturasi (VoxCeleb va Emilia datasetlarida o'qitilgan).
- **Akustik Model:** Flow-matching Latent Diffusion Transformer (DiT 450M).
- **Vokoder:** HiFi-GAN v2 va BigVGAN 24kHz.

---

## ⚖️ Litsenziya

Loyiha **Apache 2.0** ochiq litsenziyasi ostida tarqatiladi. Tijoriy va ilmiy maqsadlarda bepul foydalanish mumkin.
