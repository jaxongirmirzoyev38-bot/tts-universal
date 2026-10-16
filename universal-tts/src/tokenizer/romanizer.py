"""
Universal Romanization Module (UR-BERT alignment)
Translates writing systems into a standardized Roman phonetic alphabet.
"""

from typing import Dict


class UniversalRomanizer:
    """
    Romanizer module supporting Cyrillic, Arabic, Turkic, and universal phonetics.
    """
    
    UZ_CYR_MAP: Dict[str, str] = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'ъ': "'", 'ь': '',
        'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': "o'", 'қ': 'q', 'ғ': "g'", 'ҳ': 'h'
    }

    RU_CYR_MAP: Dict[str, str] = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
        'ъ': '"', 'ы': 'y', 'ь': "'", 'э': 'e', 'ю': 'yu', 'я': 'ya'
    }

    ARABIC_MAP: Dict[str, str] = {
        'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
        'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's',
        'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': '‘', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
        'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
        'ء': "'", 'ئ': "'y", 'ؤ': "'w", 'ى': 'a', 'ة': 'h'
    }

    def romanize(self, text: str, language: str = "uz") -> str:
        """Transliterate text into Roman script based on language code."""
        if not text:
            return ""
        
        lang = language.lower()
        mapping = self.UZ_CYR_MAP
        if lang == "ru":
            mapping = self.RU_CYR_MAP
        elif lang in ("ar", "fa"):
            mapping = self.ARABIC_MAP

        result = []
        for char in text:
            lower = char.lower()
            if lower in mapping:
                trans = mapping[lower]
                if char.isupper():
                    trans = trans.capitalize()
                result.append(trans)
            else:
                result.append(char)
        return "".join(result)
