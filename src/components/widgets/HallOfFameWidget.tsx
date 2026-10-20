import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { GAMES_CATALOG } from '../../data/gamesCatalog';

interface HallOfFameWidgetProps {
  highScores: Record<string, number>;
  onPlayGame: (gameId: string) => void;
}

export const HallOfFameWidget: React.FC<HallOfFameWidgetProps> = ({
  highScores,
  onPlayGame,
}) => {
  // Sort entries by high score
  const scoreEntries = Object.entries(highScores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const mockLeaderboard = [
    { rank: 1, user: 'Vortex_Apex', game: 'Snake 2099', score: 3450, badge: 'Grandmaster' },
    { rank: 2, user: 'NeonPhantom', game: '2048 Grid', score: 8192, badge: 'Master' },
    { rank: 3, user: 'ZeroCool_99', game: 'Reaction Tester', score: 182, badge: 'Diamond' },
    { rank: 4, user: 'CyberKitten', game: 'Flappy Cyber', score: 89, badge: 'Platinum' },
  ];

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col justify-between h-full border border-amber-500/20">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          Hall of Fame & High Scores
        </h3>
        <span className="text-[10px] text-amber-300 font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800">
          ALL-TIME RECORDS
        </span>
      </div>

      <div className="my-2 space-y-2">
        {scoreEntries.length > 0 ? (
          <div className="space-y-1.5">
            <p className="text-[11px] font-cyber text-slate-400 uppercase tracking-wider">
              Your Personal Records
            </p>
            {scoreEntries.map(([gameId, score], index) => {
              const game = GAMES_CATALOG.find((g) => g.id === gameId);
              return (
                <div
                  key={gameId}
                  onClick={() => onPlayGame(gameId)}
                  className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-cyan-300 flex items-center justify-center text-xs font-mono font-bold">
                      #{index + 1}
                    </span>
                    <span className="text-xs font-medium text-slate-200">
                      {game ? game.title : gameId}
                    </span>
                  </div>
                  <span className="text-xs font-cyber font-bold text-amber-400">
                    {score.toLocaleString()} PTS
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-[11px] font-cyber text-slate-400 uppercase tracking-wider">
              Global Challenger Board
            </p>
            {mockLeaderboard.map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 flex items-center justify-center font-bold ${
                      item.rank === 1
                        ? 'text-amber-400'
                        : item.rank === 2
                        ? 'text-slate-300'
                        : 'text-amber-600'
                    }`}
                  >
                    {item.rank === 1 ? <Crown className="w-3.5 h-3.5" /> : `#${item.rank}`}
                  </span>
                  <span className="font-mono text-slate-300">{item.user}</span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">({item.game})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                    {item.badge}
                  </span>
                  <span className="font-cyber font-bold text-amber-300">
                    {item.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-slate-400 text-center font-mono">
        Play any game to write your name into the records
      </p>
    </div>
  );
};
