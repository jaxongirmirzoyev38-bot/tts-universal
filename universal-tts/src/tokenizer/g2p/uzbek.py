"""
Uzbek G2P Module: handles Latin and Cyrillic orthography with apostrophe and digraph rules.
"""

from typing import List
from .base import BaseG2P
from ..romanizer import UniversalRomanizer


class UzbekG2P(BaseG2P):
    """G2P for Uzbek (O'zbek tili) with full IPA transcription."""

    DIGRAPHS = {
        "o'": "ø", "o‘": "ø", "o`": "ø",
        "g'": "ʁ", "g‘": "ʁ", "g`": "ʁ",
        "sh": "ʃ",
        "ch": "t͡ʃ",
        "ng": "ŋ",
    }

    PHONEME_MAP = {
        "a": "ɑ", "b": "b", "d": "d", "e": "e", "f": "ɸ", "g": "ɡ",
        "h": "h", "i": "i", "j": "d͡ʒ", "k": "k", "l": "l", "m": "m",
        "n": "n", "o": "ɔ", "p": "p", "q": "q", "r": "r", "s": "s",
        "t": "t", "u": "u", "v": "v", "x": "χ", "y": "j", "z": "z",
        "'": "ʔ"
    }

    def __init__(self):
        self.romanizer = UniversalRomanizer()

    def phonemize(self, text: str) -> List[str]:
        """Convert Uzbek text (Latin or Cyrillic) into IPA tokens."""
        # 1. First romanize if in Cyrillic
        romanized = self.romanizer.romanize(text, "uz").lower()
        phonemes: List[str] = []
        i = 0
        n = len(romanized)

        while i < n:
            # Check digraphs first
            two = romanized[i:i+2]
            if two in self.DIGRAPHS:
                phonemes.append(self.DIGRAPHS[two])
                i += 2
                continue

            char = romanized[i]
            if char in self.PHONEME_MAP:
                phonemes.append(self.PHONEME_MAP[char])
            elif char in (" ", "\n", "\t", ".", ",", "!", "?"):
                phonemes.append(char)
            i += 1

        return phonemes
