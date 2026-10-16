import React, { useState } from 'react';
import { Mic, Upload, Sparkles, CheckCircle2, Sliders, Dna, Play, Pause, RefreshCw } from 'lucide-react';
import { AudioPlayer } from './AudioPlayer';

export const VoiceCloner: React.FC = () => {
  const [activeMethod, setActiveMethod] = useState<'zero_shot' | 'few_shot' | 'full'>('zero_shot');
  const [targetText, setTargetText] = useState<string>(
    "Ushbu audio namunasi yangi klonlangan spiker profili orqali muvaffaqiyatli sintezlandi."
  );
  const [speakerName, setSpeakerName] = useState<string>('Mening Shaxsiy Ovoz Profilim');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [clonedResult, setClonedResult] = useState<any>(null);
  const [sampleLoaded, setSampleLoaded] = useState<boolean>(true);

  const runCloning = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/clone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceAudio: 'mock_sample',
          text: targetText,
          language: 'uz',
          mode: activeMethod,
          name: speakerName,
        }),
      });
      const data = await res.json();
      setClonedResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Method Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => setActiveMethod('zero_shot')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeMethod === 'zero_shot'
              ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              Usul 1 • 3–10 Sekund
            </span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <h4 className="text-sm font-semibold text-white">Zero-Shot Klonlash</h4>
          <p className="text-xs text-slate-400 mt-1">
            ECAPA-TDNN spiker embeddingi (512 o'lcham). Trening talab qilinmaydi, lahzalik natija.
          </p>
        </div>

        <div
          onClick={() => setActiveMethod('few_shot')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeMethod === 'few_shot'
              ? 'bg-slate-900 border-sky-500 shadow-lg shadow-sky-500/10'
              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">
              Usul 2 • 1–5 Daqiqa
            </span>
            <Sliders className="w-4 h-4 text-sky-400" />
          </div>
          <h4 className="text-sm font-semibold text-white">Few-Shot LoRA Fine-tune</h4>
          <p className="text-xs text-slate-400 mt-1">
            Rank=16 LoRA adapteri. Spikerning o'ziga xos intonatsiyasi va urg'usini to'liq egallaydi.
          </p>
        </div>

        <div
          onClick={() => setActiveMethod('full')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeMethod === 'full'
              ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Usul 3 • 30+ Daqiqa
            </span>
            <Dna className="w-4 h-4 text-emerald-400" />
          </div>
          <h4 className="text-sm font-semibold text-white">Full Fine-Tune</h4>
          <p className="text-xs text-slate-400 mt-1">
            DiT akustik modeli va HiFi-GAN vokoderini to'liq moslashtirish. Professional brend diktori.
          </p>
        </div>
      </div>

      {/* Main Cloning Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reference Audio Input */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-white">
              1. Etalon Ovoz Namunasi (Reference Audio)
            </label>

            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center bg-slate-950/40 hover:border-indigo-500 transition-colors">
              <div className="flex justify-center mb-3">
                <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400">
                  <Mic className="w-6 h-6" />
                </div>
              </div>
              <h5 className="text-sm font-medium text-white">Ovoz yozing yoki fayl yuklang</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Tavsiya: 5–10 soniyalik tinch muhitda ravon gapirilgan audio fayl (WAV, MP3)
              </p>

              <div className="flex items-center justify-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setSampleLoaded(true)}
                  aria-label="Namuna yuklash"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Namunani Tanlash
                </button>
              </div>

              {sampleLoaded && (
                <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-semibold text-white">sample_voice_uzbek_native.wav</span>
                      <p className="text-[11px] text-slate-400">00:06.40 • 24,000 Hz Mono • SNR: 34dB</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Yaroqli
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Klonlangan Ovoz Nomi
              </label>
              <input
                type="text"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                aria-label="Ovoz nomi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Target Synthesis Text */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-white">
              2. Klonlangan Ovozda Aytiladigan Matn
            </label>

            <textarea
              rows={4}
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
              aria-label="Klonlangan matn"
              placeholder="Ovoz klonlangach aytilishi kerak bo'lgan matnni yozing..."
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
            />

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Speaker Encoder Model:</span>
                <span className="font-mono text-white">ECAPA-TDNN (512-dim)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Akustik Sintez:</span>
                <span className="font-mono text-white">Flow-Matching DiT (OT-CFM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Vokoder:</span>
                <span className="font-mono text-white">HiFi-GAN v2 (24kHz)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={runCloning}
              disabled={isProcessing}
              aria-label="Ovozni klonlash"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Ovoz Klonlanmoqda va Sintezlanmoqda...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Ovozni Klonlash va Sintez Qilish
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Player */}
        {clonedResult && (
          <div className="pt-6 border-t border-slate-800 space-y-4">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Klonlangan Nutq Natijasi
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Spiker O'xshashligi (SMOS)</span>
                <p className="text-base font-semibold text-emerald-400 mt-0.5">
                  {(clonedResult.cosineSimilarity * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Fundamental Ton (F0)</span>
                <p className="text-base font-semibold text-sky-400 mt-0.5">
                  {clonedResult.f0Fundamental} Hz
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Embedding O'lchami</span>
                <p className="text-base font-semibold text-indigo-400 mt-0.5">
                  {clonedResult.embeddingDim} vektor
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500">Rejim</span>
                <p className="text-base font-semibold text-white mt-0.5 capitalize">
                  {clonedResult.mode.replace('_', '-')}
                </p>
              </div>
            </div>

            <AudioPlayer
              audioBase64={clonedResult.audioBase64}
              durationSeconds={4.2}
              sampleRate={clonedResult.sampleRate}
              model="UniversalTTS-ZeroShot-ECAPA"
              rtf={0.16}
              voiceName={clonedResult.name}
              text={targetText}
              langCode="uz-UZ"
            />
          </div>
        )}
      </div>
    </div>
  );
};
