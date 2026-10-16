import React from 'react';
import { Cpu, Zap, Award, CheckCircle, Database, ShieldCheck, GitFork } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Benchmark Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Sanoat Standartlari Taqqoslovi (Arena Benchmark 1240+ Ball)
              </h3>
              <p className="text-xs text-slate-400">
                Ovoz tabiiyligi (MOS), klonlash aniqligi (SMOS) va real vaqt unumdorligi (RTF)
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">Model / Tizim</th>
                <th className="py-3 px-4 font-semibold">MOS (Tabiiylik)</th>
                <th className="py-3 px-4 font-semibold">SMOS (Klonlash)</th>
                <th className="py-3 px-4 font-semibold">RTF (Kechikish)</th>
                <th className="py-3 px-4 font-semibold">WER (%)</th>
                <th className="py-3 px-4 font-semibold">Tillar Soni</th>
                <th className="py-3 px-4 font-semibold">Litsenziya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="bg-indigo-500/10 text-indigo-300 font-semibold">
                <td className="py-3.5 px-4 flex items-center gap-2 font-sans">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Universal TTS (Bizning model)
                </td>
                <td className="py-3.5 px-4 text-emerald-400">4.68 / 5.0</td>
                <td className="py-3.5 px-4 text-emerald-400">4.45 / 5.0</td>
                <td className="py-3.5 px-4 text-emerald-400">&lt; 0.18s</td>
                <td className="py-3.5 px-4 text-emerald-400">2.1%</td>
                <td className="py-3.5 px-4 font-sans">7000+ (Ochiq)</td>
                <td className="py-3.5 px-4 text-sky-400 font-sans">Apache 2.0</td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-3 px-4 font-sans">ElevenLabs v3</td>
                <td className="py-3 px-4">4.62</td>
                <td className="py-3 px-4">4.38</td>
                <td className="py-3 px-4">0.32s</td>
                <td className="py-3 px-4">2.4%</td>
                <td className="py-3 px-4 font-sans">~32 til</td>
                <td className="py-3 px-4 text-rose-400 font-sans">Yopiq (Pullik)</td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-3 px-4 font-sans">Cartesia Sonic</td>
                <td className="py-3 px-4">4.58</td>
                <td className="py-3 px-4">4.22</td>
                <td className="py-3 px-4">0.15s</td>
                <td className="py-3 px-4">2.6%</td>
                <td className="py-3 px-4 font-sans">~15 til</td>
                <td className="py-3 px-4 text-rose-400 font-sans">Yopiq (Pullik)</td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-3 px-4 font-sans">F5-TTS (Flow-matching)</td>
                <td className="py-3 px-4">4.41</td>
                <td className="py-3 px-4">4.15</td>
                <td className="py-3 px-4">0.28s</td>
                <td className="py-3 px-4">3.2%</td>
                <td className="py-3 px-4 font-sans">5 til</td>
                <td className="py-3 px-4 text-sky-400 font-sans">Ochiq kod</td>
              </tr>
              <tr className="text-slate-300">
                <td className="py-3 px-4 font-sans">OpenAI TTS HD</td>
                <td className="py-3 px-4">4.52</td>
                <td className="py-3 px-4">N/A</td>
                <td className="py-3 px-4">0.40s</td>
                <td className="py-3 px-4">2.5%</td>
                <td className="py-3 px-4 font-sans">~50 til</td>
                <td className="py-3 px-4 text-rose-400 font-sans">Yopiq (Pullik)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-indigo-500/10 text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-white">1. Akustik DiT (Diffusion Transformer)</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            16 qatlamli Latent DiT (768 hidden, 12 heads). Optimal Transport Conditional Flow Matching
            (OT-CFM) yordamida har bir fonemaning akustik traektoriyasini 32 ta qadamda aniq sintezlaydi.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-sky-500/10 text-sky-400">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-white">2. ECAPA-TDNN Speaker Encoder</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Squeeze-and-Excitation va Attentive Statistical Pooling orqali 3–10 soniya audiodan 512-o'lchamli
            spiker vektorini ajratadi. X-vector va d-vector'dan 25% yuqori aniqlik.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="p-2.5 w-fit rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-white">3. HiFi-GAN & BigVGAN Vokoder</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-Period Discriminator (MPD) va Multi-Scale Discriminator (MSD). Mel-spektrogrammani
            24,000 Hz va 44,100 Hz kristaldek tiniq audio to'lqiniga aylantiradi.
          </p>
        </div>
      </div>

      {/* Dataset Pipeline */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-sky-400" />
          O'qitish Ma'lumotlari va Preprocessing Pipeline
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-sky-400 font-semibold">Mozilla Common Voice 17.0</span>
            <p className="text-slate-400">137 ta til, 30,000+ soat audio, millionlab spikerlar.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-indigo-400 font-semibold">Google FLEURS</span>
            <p className="text-slate-400">102 ta til, yuqori sifatli n-way parallel nutq audiosi.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-semibold">Emilia & VoxPopuli</span>
            <p className="text-slate-400">100,000+ soat ko'p tilli audio kitoblar va nutqlar.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-semibold">Uzbek Speech Corpus</span>
            <p className="text-slate-400">O'zbek tili Lotin va Kirill yozuvidagi 2,000+ soat audiolari.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
