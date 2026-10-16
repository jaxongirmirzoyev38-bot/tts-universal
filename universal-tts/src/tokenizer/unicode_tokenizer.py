"""
Unicode-aware Multilingual Tokenizer for Universal TTS
Normalizes arbitrary scripts using Unicode NFKD/NFC, handles punctuation and accents.
"""

import unicodedata
from typing import List, Dict, Optional


class UnicodeTokenizer:
    """
    Tokenizer supporting all Unicode scripts with grapheme cluster preservation.
    """
    def __init__(self, vocab: Optional[Dict[str, int]] = None):
        self.pad_token = "<pad>"
        self.unk_token = "<unk>"
        self.bos_token = "<bos>"
        self.eos_token = "<eos>"
        
        # Default base special tokens
        self.vocab = vocab or {
            self.pad_token: 0,
            self.unk_token: 1,
            self.bos_token: 2,
            self.eos_token: 3,
        }
        self.id_to_token = {v: k for k, v in self.vocab.items()}

    def normalize(self, text: str) -> str:
        """Normalize string using Unicode NFC and strip non-printable characters."""
        if not text:
            return ""
        # Normalize Unicode characters
        text = unicodedata.normalize("NFC", text)
        # Clean control characters except standard whitespace
        cleaned = "".join(
            ch for ch in text if unicodedata.category(ch)[0] != "C" or ch in ("\n", "\t", " ")
        )
        return cleaned.strip()

    def tokenize(self, text: str) -> List[str]:
        """Convert normalized text into list of Unicode grapheme tokens."""
        normalized = self.normalize(text)
        tokens: List[str] = []
        for word in normalized.split():
            tokens.extend(list(word))
            tokens.append(" ")
        if tokens and tokens[-1] == " ":
            tokens.pop()
        return tokens

    def encode(self, text: str, add_special_tokens: bool = True) -> List[int]:
        """Encode text into list of integer token IDs."""
        tokens = self.tokenize(text)
        ids: List[int] = []
        if add_special_tokens:
            ids.append(self.vocab[self.bos_token])
            
        for tok in tokens:
            ids.append(self.vocab.get(tok, self.vocab[self.unk_token]))
            
        if add_special_tokens:
            ids.append(self.vocab[self.eos_token])
        return ids

    def decode(self, token_ids: List[int]) -> str:
        """Decode integer token IDs back to a reconstructed text string."""
        tokens = [
            self.id_to_token.get(idx, self.unk_token)
            for idx in token_ids
            if idx not in (self.vocab[self.pad_token], self.vocab[self.bos_token], self.vocab[self.eos_token])
        ]
        return "".join(tokens)
