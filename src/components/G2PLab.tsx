import React, { useState, useEffect } from 'react';
import { Languages, ArrowRight, BookOpen, Volume2, Sparkles } from 'lucide-react';
import { runUniversalG2P, G2PResult } from '../lib/g2p';

const SAMPLES = [
  {
    lang: 'uz',
    script: "O'zbekcha (Lotin)",
    text: "O'zbekiston Respublikasi jahon hamjamiyatida munosib o'rin egallamoqda.",
  },
  {
    lang: 'uz-cyr',
    script: "Ўзбекча (Кирилл)",
    text: "Ўзбекистон Республикаси жаҳон ҳамжамиятида муносиб ўрин эгалламоқда.",
  },
  {
    lang: 'tr',
    script: 'Türkçe',
    text: "Yapay zeka teknolojisi ses sentezinde çığır açan yeni bir döneme girdi.",
  },
  {
    lang: 'ru',
    script: 'Русский',
    text: "Универсальная система синтеза речи преобразует текст в естественный голос.",
  },
  {
    lang: 'ar',
    script: 'Arabcha',
    text: "Nizam tahwil an-nass ila kalam yad'am jami' lughat al-'alam.",
  },
  {
    lang: 'en',
    script: 'English',
    text: "Universal TTS brings expressive neural speech synthesis to 7000+ languages worldwide.",
  },
];

export const G2PLab: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('uz');
  const [inputText, setInputText] = useState<string>(SAMPLES[0].text);
  const [result, setResult] = useState<G2PResult | null>(null);

  useEffect(() => {
    const res = runUniversalG2P(inputText, selectedLanguage);
    setResult(res);
  }, [inputText, selectedLanguage]);

  return (
    <div className="space-y-6">
      {/* Sample presets */}
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample.script}
            type="button"
            onClick={() => {
              setSelectedLanguage(sample.lang);
              setInputText(sample.text);
            }}
            aria-label={`Namuna: ${sample.script}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              inputText === sample.text
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            {sample.script}
          </button>
        ))}
      </div>

      {/* Input Text Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-white flex items-center gap-2">
            <Languages className="w-4 h-4 text-sky-400" />
            Matn Kiritish (Ixtiyoriy Alifbo va Yozuv Tizimi)
          </label>
          <span className="text-xs text-slate-400 font-mono">
            Unicode NFC Normalizatsiyasi Yoqilgan
          </span>
        </div>

        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          aria-label="G2P matn"
          placeholder="Istalgan tildagi matnni kiriting..."
          className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
        />
      </div>

      {/* Results Breakdown */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Universal Romanization Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-indigo-400" />
                Universal Romanizatsiya (UR Standarti)
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                Transliteratsiya
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-sm text-indigo-300 min-h-[90px] leading-relaxed">
              {result.romanized}
            </div>
            <p className="text-xs text-slate-400">
              Kirill, Arab yoki boshqa yozuvdagi so'zlar yagona standartlashtirilgan fonetik bazaga keltiriladi.
            </p>
          </div>

          {/* IPA Phoneme Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Xalqaro Fonetika Alifbosi (IPA Transkripsiyasi)
              </h4>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                IPA Tokens
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-sm text-emerald-400 min-h-[90px] leading-relaxed">
              {result.ipa}
            </div>
            <p className="text-xs text-slate-400">
              Akustik modelga to'g'ridan-to'g'ri uzatiladigan toza fonetik tokenlar zanjiri.
            </p>
          </div>

          {/* Phonetic Syllables */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 lg:col-span-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              Bo'g'inlar va Fonetik Statistika
            </h4>

            <div className="flex flex-wrap gap-2">
              {result.syllables.map((syl, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200"
                >
                  {syl}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-800/80 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">So'zlar Soni</span>
                <p className="text-lg font-bold text-white mt-0.5">{result.stats.wordCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Belgilar Soni</span>
                <p className="text-lg font-bold text-white mt-0.5">{result.stats.charCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Unlilar (Vowels)</span>
                <p className="text-lg font-bold text-indigo-400 mt-0.5">{result.stats.vowels}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400">Undoshlar (Consonants)</span>
                <p className="text-lg font-bold text-sky-400 mt-0.5">{result.stats.consonants}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
