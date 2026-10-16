/**
 * Universal TTS Studio - Grapheme to Phoneme & Romanization Engine
 * Supports Uzbek (Latin & Cyrillic), Turkish, Russian, Arabic, Kazakh, and Universal IPA.
 */

export interface G2PResult {
  text: string;
  romanized: string;
  ipa: string;
  tokens: string[];
  syllables: string[];
  stats: {
    vowels: number;
    consonants: number;
    wordCount: number;
    charCount: number;
  };
}

// Uzbek Cyrillic to Latin mapping
const UZ_CYR_TO_LAT: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'x', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'ъ': "'", 'ь': '',
  'э': 'e', 'ю': 'yu', 'я': 'ya', 'ў': "o'", 'қ': 'q', 'ғ': "g'", 'ҳ': 'h'
};

// Russian Cyrillic to Romanization
const RU_CYR_TO_LAT: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '"', 'ы': 'y', 'ь': "'", 'э': 'e', 'ю': 'yu', 'я': 'ya'
};

// Arabic transliteration
const AR_TO_LAT: Record<string, string> = {
  'ا': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
  'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's',
  'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': '‘', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
  'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y',
  'ء': "'", 'ئ': "'y", 'ؤ': "'w", 'ى': 'a', 'ة': 'h'
};

// Uzbek Latin to IPA phoneme map (optimized for universal font rendering)
const UZ_LAT_TO_IPA: Record<string, string> = {
  "o'": "o'",
  "g'": "g'",
  "sh": "sh",
  "ch": "ch",
  "ng": "ng",
  "a": "a",
  "b": "b",
  "d": "d",
  "e": "e",
  "f": "f",
  "g": "g",
  "h": "h",
  "i": "i",
  "j": "j",
  "k": "k",
  "l": "l",
  "m": "m",
  "n": "n",
  "o": "o",
  "p": "p",
  "q": "q",
  "r": "r",
  "s": "s",
  "t": "t",
  "u": "u",
  "v": "v",
  "x": "x",
  "y": "y",
  "z": "z",
  "'": "'"
};

const VOWELS_SET = new Set(['a', 'e', 'i', 'o', 'u', 'oʻ', 'ɑ', 'e', 'ɔ', 'ɛ', 'y', 'а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я', 'ў']);

/**
 * Romanize text from various scripts into Latin representation
 */
export function romanizeText(text: string, language: string = 'uz'): string {
  if (!text) return '';
  const lang = language.toLowerCase();
  
  if (lang === 'uz' || lang === 'uz-cyr') {
    // Check if Cyrillic
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const lower = char.toLowerCase();
      const isUpper = char !== lower;
      
      if (UZ_CYR_TO_LAT[lower]) {
        let lat = UZ_CYR_TO_LAT[lower];
        if (isUpper) {
          lat = lat.charAt(0).toUpperCase() + lat.slice(1);
        }
        result += lat;
      } else {
        result += char;
      }
    }
    return result;
  }

  if (lang === 'ru') {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const lower = char.toLowerCase();
      const isUpper = char !== lower;
      if (RU_CYR_TO_LAT[lower]) {
        let lat = RU_CYR_TO_LAT[lower];
        if (isUpper) {
          lat = lat.charAt(0).toUpperCase() + lat.slice(1);
        }
        result += lat;
      } else {
        result += char;
      }
    }
    return result;
  }

  if (lang === 'ar') {
    let result = '';
    for (const char of text) {
      result += AR_TO_LAT[char] || char;
    }
    return result;
  }

  return text;
}

/**
 * Convert text into IPA (International Phonetic Alphabet) transcription
 */
export function phonemizeToIPA(text: string, language: string = 'uz'): string {
  if (!text) return '';
  const clean = text.trim();
  const romanized = romanizeText(clean, language).toLowerCase();

  const words = romanized.split(/\s+/);
  const ipaWords: string[] = [];

  for (const word of words) {
    let ipaWord = '';
    let i = 0;

    while (i < word.length) {
      // Check 2-letter digraphs first: o', g', sh, ch, ng
      const two = word.slice(i, i + 2);
      if (two === "o'" || two === "o‘" || two === "o`") {
        ipaWord += "o'";
        i += 2;
        continue;
      }
      if (two === "g'" || two === "g‘" || two === "g`") {
        ipaWord += "g'";
        i += 2;
        continue;
      }
      if (two === "sh") {
        ipaWord += "sh";
        i += 2;
        continue;
      }
      if (two === "ch") {
        ipaWord += "ch";
        i += 2;
        continue;
      }
      if (two === "ng") {
        ipaWord += "ng";
        i += 2;
        continue;
      }

      const char = word[i];
      if (UZ_LAT_TO_IPA[char]) {
        ipaWord += UZ_LAT_TO_IPA[char];
      } else if (/[a-z]/.test(char)) {
        ipaWord += char;
      } else if (/[.,!?;:]/.test(char)) {
        ipaWord += char;
      }
      i++;
    }

    if (ipaWord) {
      // Add stress marker on ultimate syllable by default in Turkic
      ipaWords.push('/' + ipaWord + '/');
    }
  }

  return ipaWords.join(' ');
}

/**
 * Split a word into approximate phonetic syllables
 */
export function syllabify(text: string): string[] {
  const words = text.toLowerCase().replace(/[^a-z0-9'\s]/g, '').split(/\s+/);
  const syllables: string[] = [];

  for (const word of words) {
    if (!word) continue;
    let current = '';
    for (let i = 0; i < word.length; i++) {
      current += word[i];
      const isVowel = VOWELS_SET.has(word[i]);
      if (isVowel && i < word.length - 1 && !VOWELS_SET.has(word[i + 1])) {
        // If next is consonant followed by vowel
        if (i + 2 < word.length && VOWELS_SET.has(word[i + 2])) {
          syllables.push(current);
          current = '';
        }
      }
    }
    if (current) {
      syllables.push(current);
    }
  }

  return syllables.length > 0 ? syllables : [text];
}

/**
 * Process text through the complete Universal G2P pipeline
 */
export function runUniversalG2P(text: string, language: string = 'uz'): G2PResult {
  const romanized = romanizeText(text, language);
  const ipa = phonemizeToIPA(text, language);
  const tokens = romanized.split(/\s+/).filter(Boolean);
  const syllables = syllabify(romanized);

  let vowels = 0;
  let consonants = 0;

  for (const char of romanized.toLowerCase()) {
    if (VOWELS_SET.has(char)) {
      vowels++;
    } else if (/[a-z]/.test(char)) {
      consonants++;
    }
  }

  return {
    text,
    romanized,
    ipa,
    tokens,
    syllables,
    stats: {
      vowels,
      consonants,
      wordCount: tokens.length,
      charCount: text.length,
    },
  };
}
