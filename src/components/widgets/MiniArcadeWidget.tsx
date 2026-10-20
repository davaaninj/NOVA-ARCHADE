import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '../../utils/soundEffects';
import { Play, RotateCcw, Trophy, Sparkles } from 'lucide-react';

interface MiniArcadeWidgetProps {
  onScoreEarned: (score: number, xp: number) => void;
}

export const MiniArcadeWidget: React.FC<MiniArcadeWidgetProps> = ({ onScoreEarned }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Stacker state
  const gridWidth = 10;
  const gridHeight = 8;
  const [currentLevel, setCurrentLevel] = useState(0);
  const [blockWidth, setBlockWidth] = useState(4);
  const [blockPos, setBlockPos] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [placedBlocks, setPlacedBlocks] = useState<Array<{ pos: number; width: number }>>([]);

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(() => {
      setBlockPos((prev) => {
        let next = prev + direction;
        if (next + blockWidth > gridWidth) {
          next = gridWidth - blockWidth;
          setDirection(-1);
        } else if (next < 0) {
          next = 0;
          setDirection(1);
        }
        return next;
      });
    }, Math.max(60, 140 - currentLevel * 8));

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, direction, blockWidth, currentLevel]);

  const handleStart = () => {
    sounds.playClick();
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setCurrentLevel(0);
    setBlockWidth(4);
    setBlockPos(0);
    setPlacedBlocks([]);
  };

  const handleStack = () => {
    if (!isPlaying) {
      handleStart();
      return;
    }
    if (gameOver) {
      handleStart();
      return;
    }

    if (currentLevel === 0) {
      // First base block placed
      sounds.playScore();
      setPlacedBlocks([{ pos: blockPos, width: blockWidth }]);
      setScore(1);
      setCurrentLevel(1);
      setBlockPos(0);
      return;
    }

    // Check overlap with previous floor
    const prev = placedBlocks[placedBlocks.length - 1];
    const currentLeft = blockPos;
    const currentRight = blockPos + blockWidth;
    const prevLeft = prev.pos;
    const prevRight = prev.pos + prev.width;

    const overlapLeft = Math.max(currentLeft, prevLeft);
    const overlapRight = Math.min(currentRight, prevRight);
    const newWidth = overlapRight - overlapLeft;

    if (newWidth <= 0) {
      // Missed completely!
      sounds.playGameOver();
      setGameOver(true);
      if (score > bestScore) setBestScore(score);
      onScoreEarned(score, score * 15);
      return;
    }

    // Successfully stacked
    sounds.playScore();
    const newScore = score + 1;
    setScore(newScore);
    if (newScore > bestScore) setBestScore(newScore);

    const newPlaced = [...placedBlocks, { pos: overlapLeft, width: newWidth }];
    setPlacedBlocks(newPlaced);

    if (currentLevel + 1 >= gridHeight) {
      // Cleared entire tower!
      sounds.playLevelUp();
      setGameOver(true);
      onScoreEarned(newScore, 100);
      return;
    }

    setCurrentLevel(currentLevel + 1);
    setBlockWidth(newWidth);
    setBlockPos(0);
  };

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col justify-between h-full border border-cyan-500/20">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Quick Stacker Mini
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Score: <strong className="text-cyan-300">{score}</strong></span>
          <span className="text-amber-400 flex items-center gap-0.5">
            <Trophy className="w-3 h-3" /> {bestScore}
          </span>
        </div>
      </div>

      {/* Mini Grid Display */}
      <div
        onClick={handleStack}
        className="my-3 bg-slate-950/80 rounded-lg p-2.5 border border-slate-800 flex flex-col-reverse gap-1 cursor-pointer select-none relative group hover:border-cyan-500/50 transition-colors"
      >
        {Array.from({ length: gridHeight }).map((_, rowIndex) => {
          const isCurrent = isPlaying && !gameOver && rowIndex === currentLevel;
          const placed = placedBlocks[rowIndex];

          return (
            <div key={rowIndex} className="grid grid-cols-10 gap-1 h-3.5">
              {Array.from({ length: gridWidth }).map((_, colIndex) => {
                let isFilled = false;
                let colorClass = 'bg-slate-900/60';

                if (isCurrent && colIndex >= blockPos && colIndex < blockPos + blockWidth) {
                  isFilled = true;
                  colorClass = 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse';
                } else if (placed && colIndex >= placed.pos && colIndex < placed.pos + placed.width) {
                  isFilled = true;
                  colorClass = 'bg-emerald-400/90 shadow-[0_0_6px_#34d399]';
                }

                return (
                  <div
                    key={colIndex}
                    className={`rounded-sm transition-all duration-75 ${colorClass}`}
                  />
                );
              })}
            </div>
          );
        })}

        {/* Overlay when game is idle / game over */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/80 rounded-lg flex flex-col items-center justify-center p-2 text-center backdrop-blur-xs">
            <p className="text-xs font-cyber text-cyan-300 font-semibold mb-1">
              PLAY DIRECTLY ON DASHBOARD
            </p>
            <p className="text-[11px] text-slate-400">Click anywhere to drop blocks</p>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/90 rounded-lg flex flex-col items-center justify-center p-2 text-center backdrop-blur-xs">
            <p className="text-sm font-cyber font-bold text-rose-400">TOWER FINISHED!</p>
            <p className="text-xs text-slate-300 font-mono mb-1">Floors: {score}</p>
            <span className="text-[10px] text-cyan-400">Click to replay</span>
          </div>
        )}
      </div>

      {/* Control button */}
      <button
        onClick={handleStack}
        className="w-full py-2 px-3 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-cyber font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
      >
        {!isPlaying ? (
          <>
            <Play className="w-3.5 h-3.5" /> START MINI STACKER
          </>
        ) : gameOver ? (
          <>
            <RotateCcw className="w-3.5 h-3.5" /> RESTART GAME
          </>
        ) : (
          'TAP TO DROP BLOCK'
        )}
      </button>
    </div>
  );
};
