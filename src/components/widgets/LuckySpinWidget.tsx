import React, { useState } from 'react';
import { sounds } from '../../utils/soundEffects';
import { Sparkles, Trophy, Gift } from 'lucide-react';

interface LuckySpinWidgetProps {
  onReward: (xp: number, message: string) => void;
}

export const LuckySpinWidget: React.FC<LuckySpinWidgetProps> = ({ onReward }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastWin, setLastWin] = useState<string | null>(null);

  const rewards = [
    { label: '+50 XP', xp: 50, color: '#06b6d4' },
    { label: '+100 XP', xp: 100, color: '#8b5cf6' },
    { label: '+75 XP', xp: 75, color: '#10b981' },
    { label: '+250 XP', xp: 250, color: '#f59e0b' },
    { label: '+150 XP', xp: 150, color: '#ec4899' },
    { label: 'JACKPOT 500 XP', xp: 500, color: '#ef4444' },
  ];

  const handleSpin = () => {
    if (isSpinning) return;
    sounds.playLaser();
    setIsSpinning(true);
    setLastWin(null);

    const extraSpins = 5 + Math.floor(Math.random() * 4);
    const winIndex = Math.floor(Math.random() * rewards.length);
    const degreesPerSlice = 360 / rewards.length;
    const targetDeg = rotation + extraSpins * 360 + (winIndex * degreesPerSlice);

    setRotation(targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      const won = rewards[winIndex];
      setLastWin(won.label);
      sounds.playLevelUp();
      onReward(won.xp, `You won ${won.label} from the Daily Spin!`);
    }, 3200);
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col justify-between h-full border border-amber-500/20">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          Quantum Lucky Spin
        </h3>
        <span className="text-[10px] text-amber-300 font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
          FREE DAILY
        </span>
      </div>

      {/* Wheel graphics */}
      <div className="my-2 flex flex-col items-center justify-center relative">
        {/* Pointer indicator */}
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-amber-400 z-20 -mb-2 filter drop-shadow-[0_0_8px_#fbbf24]" />

        <div
          className="w-28 h-28 rounded-full border-4 border-slate-800 relative overflow-hidden transition-all ease-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: isSpinning ? '3.2s' : '0s',
            transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1)',
          }}
        >
          {rewards.map((r, i) => {
            const angle = (360 / rewards.length) * i;
            return (
              <div
                key={i}
                className="absolute inset-0 origin-center"
                style={{
                  transform: `rotate(${angle}deg)`,
                  clipPath: 'polygon(50% 50%, 30% 0%, 70% 0%)',
                  backgroundColor: r.color,
                  opacity: 0.85,
                }}
              />
            );
          })}
          {/* Wheel center hub */}
          <div className="absolute inset-0 m-auto w-8 h-8 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-lg">
            <Gift className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {lastWin && (
          <p className="mt-2 text-xs font-cyber font-bold text-emerald-400 animate-bounce">
            🎉 {lastWin}!
          </p>
        )}
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 text-xs font-cyber font-bold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
      >
        {isSpinning ? 'SPINNING MATRIX...' : 'SPIN FOR FREE LOOT'}
      </button>
    </div>
  );
};
