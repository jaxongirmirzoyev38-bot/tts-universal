/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Mic,
  Languages,
  Code2,
  BarChart3,
  Sliders,
  Send,
  RefreshCw,
  Info,
  CheckCircle,
  HelpCircle,
  Globe,
  Wind,
  Smile,
  Shield,
  Layers,
} from 'lucide-react';
import { AudioPlayer } from './components/AudioPlayer';
import { RepoExplorer } from './components/RepoExplorer';
import { VoiceCloner } from './components/VoiceCloner';
import { G2PLab } from './components/G2PLab';
import { ArchitectureView } from './components/ArchitectureView';
import { VoiceOption, EmotionType } from './lib/types';
import { runUniversalG2P } from './lib/g2p';

const VOICES: VoiceOption[] = [
  {
    id: 'uz_male_dilshod',
    name: 'Dilshod',
    gender: 'male',
    language: "O'zbekcha",
    langCode: 'uz',
    accent: 'Toshkent Adabiy',
    geminiVoice: 'Fenrir',
    description: "Vazmin, aniq diktsiyali rasmiy va axborot diktori",
    avatarColor: 'from-blue-500 to-indigo-600',
    traits: ['Rasmiy', 'Aniq', 'Erkak'],
  },
  {
    id: 'uz_female_laylo',
    name: 'Laylo',
    gender: 'female',
    language: "O'zbekcha",
    langCode: 'uz',
    accent: 'Toshkent Adabiy',
    geminiVoice: 'Kore',
    description: "Samimiy, muloyim va jozibali audio-kitob va yordamchi ovozi",
    avatarColor: 'from-rose-500 to-pink-600',
    traits: ['Muloyim', 'Jozibador', 'Ayol'],
  },
  {
    id: 'tr_male_emre',
    name: 'Emre',
    gender: 'male',
    language: 'Türkçe',
    langCode: 'tr',
    accent: 'İstanbul',
    geminiVoice: 'Puck',
    description: "Dinamik, zamonaviy va tabiiy turkcha ovoz",
    avatarColor: 'from-amber-500 to-red-600',
    traits: ['Zamonaviy', 'Jonli', 'Erkak'],
  },
  {
    id: 'tr_female_aylin',
    name: 'Aylin',
    gender: 'female',
    language: 'Türkçe',
    langCode: 'tr',
    accent: 'İstanbul',
    geminiVoice: 'Zephyr',
    description: "Yumshoq, ifodali va ishonchli turkcha ayol ovozi",
    avatarColor: 'from-teal-500 to-emerald-600',
    traits: ['Yumshoq', 'Tabiiy', 'Ayol'],
  },
  {
    id: 'kk_male_timur',
    name: 'Timur',
    gender: 'male',
    language: 'Qazaqsha',
    langCode: 'kk',
    accent: 'Almaty Standard',
    geminiVoice: 'Fenrir',
    description: "Vazmin va teran qozoqcha erkak ovozi",
    avatarColor: 'from-cyan-500 to-blue-600',
    traits: ['Teran', 'Qozoqcha', 'Erkak'],
  },
  {
    id: 'ru_female_anna',
    name: 'Anna',
    gender: 'female',
    language: 'Русский',
    langCode: 'ru',
    accent: 'Москва',
    geminiVoice: 'Charon',
    description: "Klassik professional ruscha radio diktori",
    avatarColor: 'from-purple-500 to-indigo-600',
    traits: ['Professional', 'Klassik', 'Ayol'],
  },
  {
    id: 'ar_male_zayd',
    name: 'Zayd',
    gender: 'male',
    language: 'Arabcha',
    langCode: 'ar',
    accent: 'Modern Standard',
    geminiVoice: 'Puck',
    description: "Fusha arabchasi, mukammal talaffuz va fonetika",
    avatarColor: 'from-emerald-500 to-green-700',
    traits: ['Fusha', 'Tajvid', 'Erkak'],
  },
  {
    id: 'en_female_sarah',
    name: 'Sarah',
    gender: 'female',
    language: 'English',
    langCode: 'en',
    accent: 'US / International',
    geminiVoice: 'Kore',
    description: "Expressive, clear English narrator and conversational assistant",
    avatarColor: 'from-sky-500 to-blue-600',
    traits: ['Expressive', 'Narrator', 'Female'],
  },
];

const EMOTIONS: { id: EmotionType; label: string; icon: string; desc: string }[] = [
  { id: 'neutral', label: 'Neytral', icon: '😐', desc: 'Vazmin, standart va barqaror nutq' },
  { id: 'cheerful', label: 'Quvnoq / Xursand', icon: '😊', desc: 'Tabassum va iliq quvonch ohangi' },
  { id: 'formal', label: 'Jiddiy / Rasmiy', icon: '👔', desc: 'Davlat yangiliklari va rasmiy diktor' },
  { id: 'sad', label: 'G‘amgin', icon: '😔', desc: 'Sokin va muloyim mungli intonatsiya' },
  { id: 'energetic', label: 'Energetik', icon: '⚡', desc: 'Baland sur’atli va ilhomlantiruvchi' },
  { id: 'storyteller', label: 'Ertakchi / Hikoyachi', icon: '📖', desc: 'Dramatik pauzalar va badiiy ohang' },
  { id: 'whisper', label: 'Pichirlash', icon: '🤫', desc: 'Yumshoq, mayin va shivirlovchi ovoz' },
];

const QUICK_SAMPLES = [
  {
    lang: 'uz',
    text: "Assalomu alaykum! Universal TTS tizimi dunyodagi 7000 dan ortiq tilda tabiiy va ravon nutq sintezlaydi.",
    label: "O'zbekcha (Lotin)",
  },
  {
    lang: 'uz-cyr',
    text: "Ўзбекистон Республикаси мустақиллиги ва келажаги буюк давлатдир.",
    label: "Ўзбекча (Кирилл)",
  },
  {
    lang: 'tr',
    text: "Merhaba dünya! Universal TTS yapay zeka ses sistemi tüm dillerde kusursuz konuşur.",
    label: 'Türkçe',
  },
  {
    lang: 'ru',
    text: "Привет! Универсальная система синтеза речи работает на основе диффузионного трансформера.",
    label: 'Русский',
  },
  {
    lang: 'ar',
    text: "Marhaban bikum fi nizam al-sawti al-asabi muta'addid al-lughat.",
    label: 'Arabcha',
  },
  {
    lang: 'en',
    text: "Universal TTS brings ultra-realistic neural speech synthesis to every language worldwide.",
    label: 'English',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'clone' | 'g2p' | 'repo' | 'benchmarks'>('studio');
  const [text, setText] = useState<string>(QUICK_SAMPLES[0].text);
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(VOICES[0]);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType>('neutral');
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [breathBurst, setBreathBurst] = useState<boolean>(true);
  const [backchannelBurst, setBackchannelBurst] = useState<boolean>(false);
  const [stylePrompt, setStylePrompt] = useState<string>('');
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [audioResult, setAudioResult] = useState<any>(null);
  const [g2pPreview, setG2pPreview] = useState<any>(null);

  // Auto-generate phonetic preview
  useEffect(() => {
    if (text) {
      const res = runUniversalG2P(text, selectedVoice.langCode);
      setG2pPreview(res);
    }
  }, [text, selectedVoice]);

  // Initial synthetic generation so user has ready audio on mount
  useEffect(() => {
    handleSynthesize();
  }, []);

  const handleSynthesize = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          language: selectedVoice.langCode,
          voiceId: selectedVoice.id,
          emotion: selectedEmotion,
          speed,
          pitch,
          stylePrompt,
          bursts: {
            breath: breathBurst,
            backchannel: backchannelBurst,
          },
        }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        setAudioResult(data);
      }
    } catch (err) {
      console.error('TTS error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  Universal TTS Studio
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                  v1.0.0
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>7000+ Tillar</span> • 
                <span className="text-sky-400 font-medium">gemini-3.8-flash-tts</span> • 
                <span>Flow-Matching DiT</span>
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs overflow-x-auto max-w-full scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-medium shrink-0 ${
                activeTab === 'studio'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-4 h-4" />
              TTS Studiya
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('clone')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-medium shrink-0 ${
                activeTab === 'clone'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ovoz Klonlash
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('g2p')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-medium shrink-0 ${
                activeTab === 'g2p'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Languages className="w-4 h-4" />
              G2P & Romanizer
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('repo')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-medium shrink-0 ${
                activeTab === 'repo'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              GitHub Kod Baza
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('benchmarks')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-medium shrink-0 ${
                activeTab === 'benchmarks'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Arxitektura
            </button>
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Voice & Persona Setup (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Speaker Select */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-400" />
                    1. Ovoz va Tilni Tanlang
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {VOICES.length} ta tayyor spiker
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {VOICES.map((voice) => {
                    const isSelected = selectedVoice.id === voice.id;
                    return (
                      <div
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-slate-950 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                            : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${voice.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm`}>
                            {voice.name[0]}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate flex items-center gap-1">
                              {voice.name}
                              <span className="text-[10px] text-slate-400 font-normal">({voice.gender === 'male' ? 'Erkak' : 'Ayol'})</span>
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">{voice.language}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tanlangan spiker:</span>
                    <strong className="text-white">{selectedVoice.name} ({selectedVoice.accent})</strong>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{selectedVoice.description}</p>
                </div>
              </div>

              {/* Emotion & Prosody Selector */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Smile className="w-4 h-4 text-amber-400" />
                  2. Emotsiya va Ifodalilik
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EMOTIONS.map((emo) => {
                    const isSelected = selectedEmotion === emo.id;
                    return (
                      <button
                        key={emo.id}
                        type="button"
                        onClick={() => setSelectedEmotion(emo.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-lg leading-none mb-1">{emo.icon}</div>
                        <div className="text-xs font-semibold">{emo.label}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Speech Bursts and Pacing */}
                <div className="pt-2 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-sky-400" />
                      Tabiiy nafas olish (&lt;breath&gt;)
                    </span>
                    <input
                      type="checkbox"
                      checked={breathBurst}
                      onChange={(e) => setBreathBurst(e.target.checked)}
                      aria-label="Tabiiy nafas olishni qo'shish"
                      className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                    />
                  </div>

                  {/* Sliders: Speed and Pitch */}
                  <div className="space-y-3 pt-2">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Nutq tezligi (Pacing)</span>
                        <span className="font-mono text-indigo-400">{speed.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.7}
                        max={1.4}
                        step={0.05}
                        value={speed}
                        onChange={(e) => setSpeed(parseFloat(e.target.value))}
                        aria-label="Nutq tezligi"
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Ovoz balandligi (Pitch)</span>
                        <span className="font-mono text-sky-400">{pitch.toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min={0.8}
                        max={1.2}
                        step={0.05}
                        value={pitch}
                        onChange={(e) => setPitch(parseFloat(e.target.value))}
                        aria-label="Ovoz balandligi"
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Text Input, G2P Breakdown, Synthesis Action, Audio Player (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Text Input Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Mic className="w-4 h-4 text-indigo-400" />
                    3. Matn Kiriting
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {text.length} belgi • {text.split(/\s+/).filter(Boolean).length} so'z
                  </span>
                </div>

                {/* Quick samples */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SAMPLES.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setText(s.text);
                        // find matching voice if any
                        const v = VOICES.find((voice) => voice.langCode === s.lang.replace('-cyr', ''));
                        if (v) setSelectedVoice(v);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={4}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  aria-label="Nutq matni"
                  placeholder="Sintez qilinadigan matnni bu yerga yozing..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                />

                {/* Real-time Phonetic IPA & Romanization Visualizer */}
                {g2pPreview && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5 text-indigo-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        Universal G2P Transkripsiyasi (IPA):
                      </span>
                      <span className="font-mono text-emerald-400">
                        {g2pPreview.stats.vowels} unli, {g2pPreview.stats.consonants} undosh
                      </span>
                    </div>
                    <div className="font-mono text-emerald-400 text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 break-words">
                      {g2pPreview.ipa || '/.../'}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleSynthesize}
                  disabled={isGenerating || !text.trim()}
                  aria-label="Nutqni sintez qilish"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-sky-500 to-indigo-600 hover:from-indigo-600 hover:to-sky-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Gemini 3.8 Flash TTS sintez qilmoqda...
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5" />
                      Nutqni Sintez Qilish (Generate Speech)
                    </>
                  )}
                </button>
              </div>

              {/* Audio Player Card */}
              {audioResult && (
                <AudioPlayer
                  audioBase64={audioResult.audioBase64}
                  durationSeconds={audioResult.durationSeconds}
                  sampleRate={audioResult.sampleRate}
                  model={audioResult.model}
                  rtf={audioResult.rtf}
                  voiceName={selectedVoice.name}
                  text={text}
                  langCode={selectedVoice.langCode}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Voice Cloning */}
        {activeTab === 'clone' && <VoiceCloner />}

        {/* Tab 3: G2P & Romanizer Laboratory */}
        {activeTab === 'g2p' && <G2PLab />}

        {/* Tab 4: GitHub Repo Explorer (Stage 1-6) */}
        {activeTab === 'repo' && <RepoExplorer />}

        {/* Tab 5: Architecture & Benchmarks */}
        {activeTab === 'benchmarks' && <ArchitectureView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p>
            Universal TTS — Dunyo tillarining universal ochiq kodli nutq tizimi • Apache 2.0 Litsenziyasi
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              DiT Flow Matching & ECAPA-TDNN
            </span>
            <span className="text-slate-400 font-mono">RTF &lt; 0.25</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
