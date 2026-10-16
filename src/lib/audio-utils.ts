/**
 * Audio processing and WAV file generation utilities
 */

export function createWavHeader(dataLength: number, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): ArrayBuffer {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + dataLength, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, byteRate, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitsPerSample, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, dataLength, true);

  return buffer;
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Generate a synthetic speech waveform with natural formant filtering
 * Used for instant preview and fallback audio when external network / API key is absent.
 */
export function generateSyntheticSpeechWav(text: string, options: {
  speed?: number;
  pitch?: number;
  sampleRate?: number;
  gender?: 'male' | 'female';
} = {}): { base64: string; duration: number } {
  const sampleRate = options.sampleRate || 24000;
  const speed = options.speed || 1.0;
  const isFemale = options.gender === 'female';
  const baseFreq = (options.pitch ? options.pitch * (isFemale ? 220 : 130) : (isFemale ? 220 : 130));

  // Estimate duration based on text length: ~13 chars per second at 1.0x speed
  const cleanText = text.trim();
  const wordCount = cleanText.split(/\s+/).length;
  const calculatedDuration = Math.max(1.2, Math.min(25, (wordCount * 0.42 + cleanText.length * 0.05) / speed));
  const totalSamples = Math.floor(calculatedDuration * sampleRate);

  const pcmBuffer = new Int16Array(totalSamples);

  // Synthesize multi-harmonic speech with consonant burst noise and vowels
  const words = cleanText.toLowerCase().split(/\s+/);
  const samplesPerWord = Math.floor(totalSamples / Math.max(1, words.length));

  for (let s = 0; s < totalSamples; s++) {
    const t = s / sampleRate;
    const wordIdx = Math.floor(s / samplesPerWord);
    const wordProgress = (s % samplesPerWord) / samplesPerWord;

    // Natural speech cadence envelope
    let envelope = Math.sin(Math.PI * Math.min(1, Math.max(0, wordProgress)));
    if (wordProgress < 0.1) envelope = wordProgress * 10;
    else if (wordProgress > 0.85) envelope = (1 - wordProgress) * 6.6;

    // Pitch inflection across the sentence
    const phrasePitch = baseFreq * (1 + 0.08 * Math.sin(t * 3.5) - 0.05 * (s / totalSamples));

    // Formants (F1, F2, F3) simulation for human vowel resonance
    const h1 = Math.sin(2 * Math.PI * phrasePitch * t);
    const h2 = 0.55 * Math.sin(2 * Math.PI * phrasePitch * 2 * t);
    const h3 = 0.3 * Math.sin(2 * Math.PI * phrasePitch * 3 * t);
    const formant1 = 0.25 * Math.sin(2 * Math.PI * (phrasePitch * 4.2) * t);

    // Subtle noise for consonants and natural breathiness
    const noise = (Math.random() * 2 - 1) * 0.04;

    const sampleVal = (h1 + h2 + h3 + formant1 + noise) * envelope * 0.55;
    const clamped = Math.max(-1, Math.min(1, sampleVal));
    pcmBuffer[s] = Math.floor(clamped * 32767);
  }

  // Combine header + PCM
  const header = createWavHeader(pcmBuffer.byteLength, sampleRate, 1, 16);
  const combined = new Uint8Array(header.byteLength + pcmBuffer.byteLength);
  combined.set(new Uint8Array(header), 0);
  combined.set(new Uint8Array(pcmBuffer.buffer), header.byteLength);

  let binary = '';
  const len = combined.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(combined).toString('base64');

  return {
    base64,
    duration: calculatedDuration,
  };
}
