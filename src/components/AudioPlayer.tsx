import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Download, Volume2, VolumeX, Sparkles, Activity } from 'lucide-react';

interface AudioPlayerProps {
  audioBase64: string;
  durationSeconds: number;
  sampleRate: number;
  model: string;
  rtf: number;
  voiceName: string;
  text?: string;
  langCode?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBase64,
  durationSeconds,
  sampleRate,
  model,
  rtf,
  voiceName,
  text,
  langCode = 'uz-UZ',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const animationFrameRef = useRef<number | null>(null);

  const audioSrc = audioBase64.startsWith('data:')
    ? audioBase64
    : `data:audio/wav;base64,${audioBase64}`;

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [audioBase64]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioSrc;
    a.download = `universal-tts-${voiceName.toLowerCase()}-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const changeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  // Canvas Waveform Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const numBars = 48;
      const barWidth = (width / numBars) - 2;

      for (let i = 0; i < numBars; i++) {
        const progress = i / numBars;
        // Animated waveform height based on isPlaying
        const baseAmp = isPlaying ? 0.4 + 0.5 * Math.sin(phase + i * 0.3) : 0.15;
        const waveHeight = Math.max(4, baseAmp * (height - 10) * (0.6 + 0.4 * Math.sin(progress * Math.PI)));
        const x = i * (barWidth + 2);
        const y = (height - waveHeight) / 2;

        const isCurrent = (currentTime / Math.max(0.1, durationSeconds)) >= progress;

        // Gradient coloring
        const grad = ctx.createLinearGradient(0, y, 0, y + waveHeight);
        if (isCurrent) {
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(1, '#6366f1');
        } else {
          grad.addColorStop(0, '#475569');
          grad.addColorStop(1, '#334155');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, waveHeight, 3);
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.15;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, currentTime, durationSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl text-white">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            {model}
          </span>
          <span className="text-slate-400">Ovoz: <strong className="text-slate-200">{voiceName}</strong></span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            RTF: <span className="text-emerald-400 font-semibold">{rtf < 0.25 ? `< 0.25 (${rtf})` : rtf}</span>
          </span>
          <span>{sampleRate.toLocaleString()} Hz WAV</span>
        </div>
      </div>

      {/* Waveform Canvas */}
      <div className="py-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={64}
          className="w-full h-16 rounded-lg bg-slate-950/60 border border-slate-800/50"
        />
      </div>

      {/* Progress Slider */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={durationSeconds || 1}
          step={0.01}
          value={currentTime}
          onChange={handleSeek}
          aria-label="Audio timeline position"
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(durationSeconds)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pauza' : "O'ynatish"}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            aria-label="Boshidan boshlash"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Qayta tinglash"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="flex items-center bg-slate-800 rounded-xl p-1 text-xs font-medium ml-2">
            {[0.75, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => changeRate(rate)}
                aria-label={`Tezlik ${rate}x`}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  playbackRate === rate
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <button
              type="button"
              onClick={() => {
                if (audioRef.current) {
                  const nextMuted = !isMuted;
                  audioRef.current.muted = nextMuted;
                  setIsMuted(nextMuted);
                }
              }}
              aria-label={isMuted ? "Ovozni yoqish" : "Ovozni o'chirish"}
              className="p-1 hover:text-white cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                setIsMuted(false);
                if (audioRef.current) {
                  audioRef.current.volume = v;
                  audioRef.current.muted = false;
                }
              }}
              aria-label="Ovoz balandligi"
              className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          {text && typeof window !== 'undefined' && 'speechSynthesis' in window && (
            <button
              type="button"
              onClick={() => {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(text);
                utter.rate = playbackRate;
                utter.pitch = 1.0;
                // Try matching voice
                const voices = window.speechSynthesis.getVoices();
                const matched = voices.find(v => v.lang.startsWith(langCode.slice(0, 2)));
                if (matched) utter.voice = matched;
                window.speechSynthesis.speak(utter);
              }}
              aria-label="Brauzer ovozida tinglash"
              title="Brauzer mahalliy ovozida tinglash"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-indigo-400" />
              Mahalliy Ovoz
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            aria-label="WAV yuklab olish"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            WAV Yuklab Olish
          </button>
        </div>
      </div>
    </div>
  );
};
