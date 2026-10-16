"""
Base Grapheme-to-Phoneme (G2P) Interface
"""

from abc import ABC, abstractmethod
from typing import List


class BaseG2P(ABC):
    """Abstract Base Class for language-specific G2P implementations."""

    @abstractmethod
    def phonemize(self, text: str) -> List[str]:
        """Convert input graphemes into IPA phoneme tokens."""
        pass
