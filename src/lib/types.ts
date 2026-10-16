export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female';
  language: string;
  langCode: string;
  accent: string;
  geminiVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  description: string;
  avatarColor: string;
  previewUrl?: string;
  traits: string[];
}

export type EmotionType = 'neutral' | 'cheerful' | 'formal' | 'sad' | 'energetic' | 'storyteller' | 'whisper';

export interface TTSRequestPayload {
  text: string;
  language: string;
  voiceId: string;
  emotion: EmotionType;
  speed: number;
  pitch: number;
  stylePrompt?: string;
  speechBursts?: {
    breath?: boolean;
    backchannel?: boolean;
    laughs?: boolean;
  };
}

export interface TTSResponseData {
  audioBase64: string;
  format: string;
  sampleRate: number;
  durationSeconds: number;
  ipaTranscription: string;
  romanizedText: string;
  rtf: number;
  latencyMs: number;
  model: string;
  voiceUsed: string;
}

export interface VoiceCloneRecord {
  id: string;
  name: string;
  gender: 'male' | 'female';
  method: 'zero_shot' | 'few_shot' | 'full';
  speakerEmbedding: number[];
  audioSampleName: string;
  durationSec: number;
  cosineSimilarity: number;
  createdAt: string;
  f0Fundamental: number;
}

export interface RepoFileNode {
  path: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
  language?: string;
  description?: string;
  stage: 1 | 2 | 3 | 4 | 5 | 6;
  content?: string;
  children?: RepoFileNode[];
}
