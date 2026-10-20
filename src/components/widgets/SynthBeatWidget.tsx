import React, { useState } from 'react';
import { sounds } from '../../utils/soundEffects';
import { Music, Volume2, Sparkles } from 'lucide-react';

export const SynthBeatWidget: React.FC = () => {
  const [activePad, setActivePad] = useState<number | null>(null);

  const pads = [
    { id: 1, label: 'SUB BASS', freq: 65, type: 'triangle' as OscillatorType, color: 'border-cyan-500 text-cyan-400 bg-cyan-950/40' },
    { id: 2, label: 'CYBER KICK', freq: 110, type: 'square' as OscillatorType, color: 'border-blue-500 text-blue-400 bg-blue-950/40' },
    { id: 3, label: 'NEON SNARE', freq: 280, type: 'sawtooth' as OscillatorType, color: 'border-purple-500 text-purple-400 bg-purple-950/40' },
    { id: 4, label: 'HI-HAT', freq: 600, type: 'sine' as OscillatorType, color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40' },
    { id: 5, label: 'DATA CHIME', freq: 880, type: 'sine' as OscillatorType, color: 'border-amber-500 text-amber-400 bg-amber-950/40' },
    { id: 6, label: 'LASER ZAP', freq: 1200, type: 'sawtooth' as OscillatorType, color: 'border-rose-500 text-rose-400 bg-rose-950/40' },
  ];

  const handleTrigger = (pad: typeof pads[0]) => {
    setActivePad(pad.id);
    sounds.playTone(pad.freq, pad.type, 0.22);
    setTimeout(() => setActivePad(null), 180);
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col justify-between h-full border border-purple-500/20">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-1.5">
          <Music className="w-4 h-4 text-purple-400" />
          Cyber Beat Synthesizer
        </h3>
        <span className="text-[10px] text-purple-300 font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800">
          LIVE AUDIO
        </span>
      </div>

      {/* Visualizer bars */}
      <div className="my-3 flex items-end justify-center gap-1.5 h-12 bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
        {[40, 75, 55, 90, 65, 80, 45, 100, 70, 85].map((h, i) => (
          <div
            key={i}
            className={`w-2 rounded-t transition-all duration-150 ${
              activePad !== null
                ? 'bg-gradient-to-t from-purple-500 to-cyan-400'
                : 'bg-slate-800'
            }`}
            style={{
              height: activePad !== null ? `${h}%` : '20%',
            }}
          />
        ))}
      </div>

      {/* 6 Pads */}
      <div className="grid grid-cols-3 gap-2">
        {pads.map((p) => {
          const isActive = activePad === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleTrigger(p)}
              className={`p-2.5 rounded-lg border text-center font-cyber font-bold text-[11px] transition-all cursor-pointer active:scale-95 ${
                p.color
              } ${
                isActive
                  ? 'brightness-150 scale-95 shadow-[0_0_15px_currentColor]'
                  : 'hover:brightness-125'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
        Tap pads to compose your personal gaming beat
      </p>
    </div>
  );
};
