import React from 'react';
import { Achievement } from '../../types';
import { Award, CheckCircle2, Lock, Zap } from 'lucide-react';

interface AchievementsWidgetProps {
  achievements: Achievement[];
}

export const AchievementsWidget: React.FC<AchievementsWidgetProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const progressPercent = Math.round((unlockedCount / achievements.length) * 100);

  return (
    <div className="glass-panel rounded-xl p-5 border border-indigo-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <h3 className="font-cyber font-bold text-base text-white">
            Cyber Trophies & Milestones
          </h3>
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800 text-indigo-300 font-mono">
            {unlockedCount} / {achievements.length} UNLOCKED
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 w-full sm:w-48">
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-indigo-500 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-400 shrink-0">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Grid of trophies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        {achievements.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
              item.unlocked
                ? 'bg-indigo-950/40 border-indigo-500/40 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]'
                : 'bg-slate-900/30 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`p-1.5 rounded-md ${
                  item.unlocked ? 'bg-indigo-500 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {item.unlocked ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              </span>
              <span className="text-[10px] font-mono text-indigo-300 flex items-center gap-0.5">
                <Zap className="w-3 h-3 text-amber-400" /> +{item.xpReward} XP
              </span>
            </div>

            <div>
              <h4 className="text-xs font-cyber font-bold text-slate-200 mb-1">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-400 leading-tight">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
