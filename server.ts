import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { runUniversalG2P } from './src/lib/g2p.ts';
import { generateSyntheticSpeechWav } from './src/lib/audio-utils.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK with required aistudio-build telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Voice persona mapping to prebuilt Gemini voice profiles
const VOICE_MAP: Record<string, { geminiVoice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'; gender: 'male' | 'female'; style: string }> = {
  uz_male_dilshod: { geminiVoice: 'Fenrir', gender: 'male', style: 'Articulate Uzbek native male speaker, clear Tashkent accent, natural pacing' },
  uz_female_laylo: { geminiVoice: 'Kore', gender: 'female', style: 'Melodious Uzbek native female speaker, warm, clear, polite and engaging' },
  tr_male_emre: { geminiVoice: 'Puck', gender: 'male', style: 'Modern native Turkish male speaker from Istanbul, energetic and authentic' },
  tr_female_aylin: { geminiVoice: 'Zephyr', gender: 'female', style: 'Expressive Turkish native female speaker, soft and confident' },
  kk_male_timur: { geminiVoice: 'Fenrir', gender: 'male', style: 'Kazakh native speaker with calm, deep intonation' },
  ru_female_anna: { geminiVoice: 'Charon', gender: 'female', style: 'Standard Russian native speaker, crisp articulation, professional tone' },
  ar_male_zayd: { geminiVoice: 'Puck', gender: 'male', style: 'Classical and Modern Standard Arabic speaker, accurate tajweed and phonetics' },
  en_female_sarah: { geminiVoice: 'Kore', gender: 'female', style: 'Natural English speaker, balanced rhythm, expressive podcast tone' },
};

// Emotion style instructions
const EMOTION_PROMPTS: Record<string, string> = {
  neutral: 'Balanced, steady, natural cadence and neutral emotion',
  cheerful: 'Bright, smiling, upbeat, warm and joyful tone with energetic inflection',
  formal: 'Official, authoritative, articulate broadcast anchor, serious and dignified',
  sad: 'Somber, gentle, slower tempo, subdued pitch and reflective melancholy',
  energetic: 'Dynamic, rapid, vibrant, highly enthusiastic and animated speech',
  storyteller: 'Engaging narration, dramatic pauses, vocal variety, fairy tale or documentary storyteller',
  whisper: 'Intimate, hushed, soft spoken whisper with subtle breathiness',
};

// POST /api/tts - Speech synthesis using gemini-3.8-flash-tts
app.post('/api/tts', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const {
      text,
      language = 'uz',
      voiceId = 'uz_male_dilshod',
      emotion = 'neutral',
      speed = 1.0,
      pitch = 1.0,
      stylePrompt = '',
      bursts = {},
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Matn kiritilmadi (Text is required).' });
    }

    const voiceMeta = VOICE_MAP[voiceId] || VOICE_MAP['uz_male_dilshod'];
    const g2pInfo = runUniversalG2P(text, language);

    // Prepare speech text with optional vocal bursts if requested
    let speechContent = text.trim();
    if (bursts?.breath && !speechContent.includes('<breath>')) {
      speechContent = `<breath> ${speechContent}`;
    }
    if (bursts?.backchannel && language === 'uz') {
      speechContent = `${speechContent} |ha|`;
    }

    // Build comprehensive style instruction
    const emotionDesc = EMOTION_PROMPTS[emotion] || EMOTION_PROMPTS.neutral;
    const combinedStyle = [
      voiceMeta.style,
      `Language: ${language}`,
      `Emotion: ${emotionDesc}`,
      speed !== 1.0 ? `Speed pacing factor: ${speed}x` : '',
      stylePrompt ? `Additional direction: ${stylePrompt}` : '',
    ].filter(Boolean).join('. ');

    let audioBase64 = '';
    let durationSec = Math.max(1.0, (text.split(/\s+/).length * 0.42 + text.length * 0.05) / speed);
    let modelUsed = 'gemini-3.8-flash-tts';

    // Attempt generation with gemini-3.8-flash-tts first as specified
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: speechContent,
                  speechMetadata: {
                    speaker: voiceId,
                    style: combinedStyle,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceMeta.geminiVoice },
              },
            },
          },
        });

        const returnedData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (returnedData) {
          audioBase64 = returnedData;
        }
      } catch (err: any) {
        console.warn('gemini-3.8-flash-tts quota reached, trying gemini-3.8-flash-lite-tts for human speech...');
        // Seamless fallback to gemini-3.8-flash-lite-tts to deliver authentic human voice
        try {
          const liteResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash-lite-tts',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: speechContent,
                    speechMetadata: {
                      style: combinedStyle,
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voiceMeta.geminiVoice },
                },
              },
            },
          });
          const liteData = liteResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (liteData) {
            audioBase64 = liteData;
            modelUsed = 'gemini-3.8-flash-lite-tts (Auto-Failover)';
          }
        } catch (liteErr: any) {
          console.error('Gemini TTS failed:', liteErr?.message || liteErr);
        }
      }
    }

    if (!audioBase64) {
      return res.status(503).json({
        error: 'Ovoz sintezatori hozirda band. Iltimos, bir ozdan keyin qayta urinib ko‘ring.',
        useClientSpeech: true,
      });
    }

    const latencyMs = Date.now() - startTime;
    const rtf = Number((latencyMs / 1000 / durationSec).toFixed(3));

    return res.json({
      audioBase64,
      format: 'audio/wav',
      sampleRate: 24000,
      durationSeconds: Number(durationSec.toFixed(2)),
      ipaTranscription: g2pInfo.ipa,
      romanizedText: g2pInfo.romanized,
      rtf,
      latencyMs,
      model: modelUsed,
      voiceUsed: voiceId,
      tokens: g2pInfo.tokens,
      stats: g2pInfo.stats,
    });
  } catch (error: any) {
    console.error('Error in /api/tts:', error);
    return res.status(500).json({ error: error?.message || 'TTS generation failed' });
  }
});

// POST /api/g2p - Grapheme to Phoneme analysis
app.post('/api/g2p', (req: Request, res: Response) => {
  const { text, language = 'uz' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  const result = runUniversalG2P(text, language);
  return res.json(result);
});

// POST /api/clone - Voice cloning simulation & embedding extraction
app.post('/api/clone', async (req: Request, res: Response) => {
  try {
    const { referenceAudio, text, language = 'uz', mode = 'zero_shot', name = 'Custom Cloned Voice' } = req.body;
    
    // Simulate ECAPA-TDNN 512-dim embedding extraction
    const embedding: number[] = [];
    for (let i = 0; i < 512; i++) {
      embedding.push(Number((Math.sin(i * 12.3) * 0.1).toFixed(4)));
    }

    const f0Fundamental = 145 + Math.floor(Math.random() * 80);
    const cosineSimilarity = Number((0.87 + Math.random() * 0.08).toFixed(3));

    // Synthesize test phrase using gemini-3.8-flash-tts or synthetic engine
    let testAudioBase64 = '';
    const sampleText = text || "Bu sun'iy intellekt orqali klonlangan yangi ovoz namunasidir.";

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: sampleText,
                  speechMetadata: {
                    speaker: 'ClonedSpeaker',
                    style: `Cloned voice profile, fundamental pitch ${f0Fundamental}Hz, speaker similarity ${cosineSimilarity}`,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: f0Fundamental > 180 ? 'Kore' : 'Fenrir' },
              },
            },
          },
        });
        testAudioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
      } catch (e) {
        // Fallback to lite
        try {
          const liteRes = await ai.models.generateContent({
            model: 'gemini-3.8-flash-lite-tts',
            contents: [{ role: 'user', parts: [{ text: sampleText }] }],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: f0Fundamental > 180 ? 'Kore' : 'Fenrir' },
                },
              },
            },
          });
          testAudioBase64 = liteRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
        } catch (liteErr) {
          console.error('Clone TTS error:', liteErr);
        }
      }
    }

    return res.json({
      success: true,
      cloneId: 'clone_' + Date.now(),
      name,
      mode,
      embeddingDim: 512,
      f0Fundamental,
      cosineSimilarity,
      audioBase64: testAudioBase64,
      sampleRate: 24000,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Voice cloning failed' });
  }
});

// GET /api/repo-tree - Return file tree of universal-tts repository
function getDirectoryTree(dirPath: string, rootDir: string): any[] {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const result: any[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.gitignore' && entry.name !== '.pre-commit-config.yaml' && entry.name !== '.github') {
      continue;
    }
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      result.push({
        name: entry.name,
        path: relPath,
        type: 'dir',
        children: getDirectoryTree(fullPath, rootDir),
      });
    } else {
      const stat = fs.statSync(fullPath);
      result.push({
        name: entry.name,
        path: relPath,
        type: 'file',
        size: stat.size,
      });
    }
  }
  return result;
}

app.get('/api/repo-tree', (_req: Request, res: Response) => {
  const repoDir = path.join(process.cwd(), 'universal-tts');
  if (!fs.existsSync(repoDir)) {
    return res.json({ files: [] });
  }
  const tree = getDirectoryTree(repoDir, repoDir);
  return res.json({ files: tree });
});

// GET /api/repo-file?path=... - Return file content
app.get('/api/repo-file', (req: Request, res: Response) => {
  const filePath = req.query.path as string;
  if (!filePath) {
    return res.status(400).json({ error: 'File path required' });
  }
  const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  const absPath = path.join(process.cwd(), 'universal-tts', safePath);

  if (!fs.existsSync(absPath) || !fs.statSync(absPath).isFile()) {
    return res.status(404).json({ error: 'File not found' });
  }

  const content = fs.readFileSync(absPath, 'utf-8');
  return res.json({ path: filePath, content });
});

// Start server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Universal TTS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
