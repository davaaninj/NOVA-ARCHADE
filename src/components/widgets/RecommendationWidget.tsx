import React from 'react';
import { GameDefinition } from '../../types';
import { Sparkles, Play, Compass } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface RecommendationWidgetProps {
  recommendedGame: GameDefinition;
  onPlay: (game: GameDefinition) => void;
  reason: string;
}

export const RecommendationWidget: React.FC<RecommendationWidgetProps> = ({
  recommendedGame,
  onPlay,
  reason,
}) => {
  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col justify-between h-full border border-teal-500/20">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-teal-400" />
          Smart Matchmaker
        </h3>
        <span className="text-[10px] text-teal-300 font-mono px-2 py-0.5 rounded bg-teal-950/60 border border-teal-800">
          ALGORITHM PICK
        </span>
      </div>

      <div className="my-2 space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: recommendedGame.accentColor }}
          />
          <h4 className="font-cyber font-bold text-base text-white">
            {recommendedGame.title}
          </h4>
        </div>
        <p className="text-xs text-slate-300 line-clamp-2">
          {recommendedGame.description}
        </p>
        <div className="p-2 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-teal-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>{reason}</span>
        </div>
      </div>

      <button
        onClick={() => {
          sounds.playClick();
          onPlay(recommendedGame);
        }}
        className="w-full py-2 px-3 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 text-teal-200 text-xs font-cyber font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        TRY THIS GAME NOW
      </button>
    </div>
  );
};
