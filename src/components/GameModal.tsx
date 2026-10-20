import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameDefinition } from '../types';
import { sounds } from '../utils/soundEffects';
import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Trophy,
  Flame,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  slideAndMergeRow,
  evaluateWordleGuess,
  findBestTicTacToeMove,
  WordleStatus,
} from '../utils/gameRules';

interface GameModalProps {
  game: GameDefinition | null;
  onClose: () => void;
  onGameOver: (gameId: string, score: number, xpEarned: number) => void;
  currentHighScore: number;
}

export const GameModal: React.FC<GameModalProps> = ({
  game,
  onClose,
  onGameOver,
  currentHighScore,
}) => {
  if (!game) return null;

  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const modalContainerRef = useRef<HTMLDivElement | null>(null);

  // High score tracking
  const [sessionHighScore, setSessionHighScore] = useState(currentHighScore);

  // Common game over handler
  const triggerGameOver = useCallback(
    (finalScore: number) => {
      sounds.playGameOver();
      setIsGameOver(true);
      if (finalScore > sessionHighScore) {
        setSessionHighScore(finalScore);
      }
      const xpGained = Math.max(30, Math.round(finalScore * 1.5));
      onGameOver(game.id, finalScore, xpGained);
    },
    [game.id, sessionHighScore, onGameOver]
  );

  const toggleMute = () => {
    const next = !isMuted;
    sounds.setMuted(next);
    setIsMuted(next);
  };

  const toggleFullscreen = () => {
    if (!modalContainerRef.current) return;
    if (!document.fullscreenElement) {
      modalContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div
        ref={modalContainerRef}
        className="w-full max-w-4xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
      >
        {/* Arcade Cabinet Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: game.accentColor }}
            />
            <div>
              <h2 className="font-cyber font-bold text-base sm:text-lg text-white leading-tight">
                {game.title}
              </h2>
              <span className="text-[11px] text-slate-400 capitalize font-mono">
                {game.genre} • {game.difficulty} Mode
              </span>
            </div>
          </div>

          {/* Current Score & High Score */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 font-mono text-xs">
              <span className="text-slate-400">SCORE:</span>
              <span className="font-bold text-cyan-400 text-sm">{score}</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-amber-400 text-xs font-mono">
              <Trophy className="w-4 h-4" />
              <span>BEST: {sessionHighScore}</span>
            </div>

            <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label="Toggle Sound"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer hidden sm:block"
                title="Fullscreen"
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                title="Close"
                aria-label="Exit Game"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Game Screen Viewport */}
        <div className="relative min-h-[420px] max-h-[75vh] flex items-center justify-center bg-slate-950 p-2 sm:p-4 overflow-hidden">
          <GameDispatcher
            gameId={game.id}
            score={score}
            setScore={setScore}
            isGameOver={isGameOver}
            setIsGameOver={setIsGameOver}
            triggerGameOver={triggerGameOver}
            accentColor={game.accentColor}
          />

          {/* Game Over Modal Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-200">
              <div className="p-3 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mb-3">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-cyber font-bold text-white mb-1">
                RUN TERMINATED
              </h3>
              <p className="text-sm text-slate-400 font-mono mb-4">
                {game.title}
              </p>

              <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Final Score</span>
                  <p className="text-xl font-bold font-cyber text-cyan-400">{score}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">XP Earned</span>
                  <p className="text-xl font-bold font-cyber text-emerald-400">+{Math.max(30, Math.round(score * 1.5))}</p>
                </div>
              </div>

              {score >= sessionHighScore && score > 0 && (
                <div className="mb-4 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-cyber flex items-center gap-1.5 animate-bounce">
                  <Flame className="w-4 h-4 text-amber-400" /> NEW PERSONAL BEST!
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsGameOver(false);
                    setScore(0);
                  }}
                  className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> PLAY AGAIN
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-cyber font-bold text-xs cursor-pointer active:scale-95"
                >
                  BACK TO DASHBOARD
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar Footer */}
        <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Controls:</span>
            <span className="font-mono text-slate-400">{game.controls}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {game.instructions}
          </span>
        </div>
      </div>
    </div>
  );
};

// Internal Game Dispatcher router
interface GameDispatcherProps {
  gameId: string;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  isGameOver: boolean;
  setIsGameOver: React.Dispatch<React.SetStateAction<boolean>>;
  triggerGameOver: (score: number) => void;
  accentColor: string;
}

const GameDispatcher: React.FC<GameDispatcherProps> = (props) => {
  const { gameId } = props;

  switch (gameId) {
    case 'snake':
      return <SnakeGame {...props} />;
    case 'pong':
      return <PongGame {...props} />;
    case 'brick-breaker':
      return <BrickBreakerGame {...props} />;
    case 'space-invaders':
      return <SpaceInvadersGame {...props} />;
    case 'flappy-cyber':
      return <FlappyGame {...props} />;
    case '2048':
      return <Game2048 {...props} />;
    case 'minesweeper':
      return <MinesweeperGame {...props} />;
    case 'memory-matrix':
      return <MemoryMatrixGame {...props} />;
    case 'reaction-test':
      return <ReactionTestGame {...props} />;
    case 'color-match':
      return <ColorMatchGame {...props} />;
    case 'speed-typer':
      return <SpeedTyperGame {...props} />;
    case 'tictactoe-ai':
      return <TicTacToeGame {...props} />;
    case 'aim-trainer':
      return <AimTrainerGame {...props} />;
    case 'simon-sound':
      return <SimonSoundGame {...props} />;
    case 'geometry-jump':
      return <GeometryJumpGame {...props} />;
    case 'wordle-cyber':
      return <WordleGame {...props} />;
    case 'math-sprint':
      return <MathSprintGame {...props} />;
    case 'blackjack-21':
      return <BlackjackGame {...props} />;
    case 'knife-target':
      return <KnifeTargetGame {...props} />;
    case 'fruit-slice':
      return <FruitSliceGame {...props} />;
    case 'air-hockey':
      return <AirHockeyGame {...props} />;
    case 'sand-toy':
      return <FallingSandGame {...props} />;
    case 'crossy-street':
      return <CrossyGame {...props} />;
    case 'trivia-tech':
      return <TriviaGame {...props} />;
    case 'whack-a-mole':
      return <WhackAMoleGame {...props} />;
    case 'slider-15':
      return <Slider15Game {...props} />;
    case 'connect-4':
      return <Connect4Game {...props} />;
    case 'tower-stacker':
      return <TowerStackerGame {...props} />;
    default:
      return <UniversalArcadeRunner {...props} />;
  }
};

/* -------------------------------------------------------------
 * 1. SNAKE GAME
 * ------------------------------------------------------------- */
const SnakeGame: React.FC<GameDispatcherProps> = ({
  score,
  setScore,
  isGameOver,
  triggerGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const snakeRef = useRef<Array<{ x: number; y: number }>>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const dirRef = useRef<{ x: number; y: number }>({ x: 1, y: 0 });
  const foodRef = useRef<{ x: number; y: number }>({ x: 15, y: 10 });
  const scoreRef = useRef(0);

  const gridSize = 20;
  const tileCount = 20;

  const startRun = () => {
    if (!hasStarted) {
      sounds.playClick();
      setHasStarted(true);
    }
  };

  useEffect(() => {
    scoreRef.current = 0;
    setScore(0);
    setHasStarted(false);
    snakeRef.current = [
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ];
    dirRef.current = { x: 1, y: 0 };
    foodRef.current = { x: 15, y: 10 };

    const handleKey = (e: KeyboardEvent) => {
      setHasStarted(true);
      const d = dirRef.current;
      if ((e.key === 'ArrowUp' || e.key === 'w') && d.y === 0) dirRef.current = { x: 0, y: -1 };
      if ((e.key === 'ArrowDown' || e.key === 's') && d.y === 0) dirRef.current = { x: 0, y: 1 };
      if ((e.key === 'ArrowLeft' || e.key === 'a') && d.x === 0) dirRef.current = { x: -1, y: 0 };
      if ((e.key === 'ArrowRight' || e.key === 'd') && d.x === 0) dirRef.current = { x: 1, y: 0 };
    };

    window.addEventListener('keydown', handleKey);

    const interval = setInterval(() => {
      if (isGameOver) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
      for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
      }

      // Draw Food
      ctx.fillStyle = '#f43f5e';
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(
        foodRef.current.x * gridSize + gridSize / 2,
        foodRef.current.y * gridSize + gridSize / 2,
        gridSize / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Snake
      snakeRef.current.forEach((seg, i) => {
        ctx.fillStyle = i === 0 ? '#10b981' : '#059669';
        ctx.fillRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2);
      });

      // If not started yet, don't move
      if (!hasStarted) return;

      const head = {
        x: snakeRef.current[0].x + dirRef.current.x,
        y: snakeRef.current[0].y + dirRef.current.y,
      };

      // Check wall collision
      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        triggerGameOver(scoreRef.current);
        return;
      }

      // Check self collision
      if (snakeRef.current.some((segment) => segment.x === head.x && segment.y === head.y)) {
        triggerGameOver(scoreRef.current);
        return;
      }

      const newSnake = [head, ...snakeRef.current];

      // Check food
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        sounds.playScore();
        scoreRef.current += 10;
        setScore(scoreRef.current);
        foodRef.current = {
          x: Math.floor(Math.random() * tileCount),
          y: Math.floor(Math.random() * tileCount),
        };
      } else {
        newSnake.pop();
      }

      snakeRef.current = newSnake;
    }, 110);

    return () => {
      window.removeEventListener('keydown', handleKey);
      clearInterval(interval);
    };
  }, [hasStarted, isGameOver, triggerGameOver, setScore]);

  return (
    <div className="flex flex-col items-center gap-3 relative">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          onClick={startRun}
          className="rounded-xl border border-emerald-500/30 max-w-full aspect-square bg-slate-950 shadow-lg cursor-pointer"
        />
        {!hasStarted && (
          <div
            onClick={startRun}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center cursor-pointer p-4 text-center z-10"
          >
            <p className="text-sm font-cyber font-bold text-emerald-400 mb-1">
              READY TO PLAY
            </p>
            <p className="text-xs text-slate-300 font-mono mb-3">
              Press Arrow Keys, WASD, or Tap to Begin
            </p>
            <button className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-cyber font-bold text-xs shadow-lg shadow-emerald-500/30 active:scale-95">
              START MISSION
            </button>
          </div>
        )}
      </div>
      {/* Mobile Touch D-Pad */}
      <div className="grid grid-cols-3 gap-1.5 w-36 sm:hidden">
        <div />
        <button
          onClick={() => { setHasStarted(true); if (dirRef.current.y === 0) dirRef.current = { x: 0, y: -1 }; }}
          className="p-3 rounded bg-slate-800 text-white flex items-center justify-center active:bg-cyan-600"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />
        <button
          onClick={() => { setHasStarted(true); if (dirRef.current.x === 0) dirRef.current = { x: -1, y: 0 }; }}
          className="p-3 rounded bg-slate-800 text-white flex items-center justify-center active:bg-cyan-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setHasStarted(true); if (dirRef.current.y === 0) dirRef.current = { x: 0, y: 1 }; }}
          className="p-3 rounded bg-slate-800 text-white flex items-center justify-center active:bg-cyan-600"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setHasStarted(true); if (dirRef.current.x === 0) dirRef.current = { x: 1, y: 0 }; }}
          className="p-3 rounded bg-slate-800 text-white flex items-center justify-center active:bg-cyan-600"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 2. PONG MATRIX
 * ------------------------------------------------------------- */
const PongGame: React.FC<GameDispatcherProps> = ({ setScore, isGameOver, triggerGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    p1Y: 150,
    p2Y: 150,
    ballX: 200,
    ballY: 150,
    vx: 4,
    vy: 2.5,
    p1Score: 0,
    p2Score: 0,
  });

  useEffect(() => {
    stateRef.current = {
      p1Y: 150,
      p2Y: 150,
      ballX: 200,
      ballY: 150,
      vx: 4,
      vy: 2.5,
      p1Score: 0,
      p2Score: 0,
    };
    setScore(0);

    const handleMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      stateRef.current.p1Y = Math.max(10, Math.min(230, relativeY - 35));
    };

    window.addEventListener('mousemove', handleMove);

    const interval = setInterval(() => {
      if (isGameOver) return;
      const s = stateRef.current;
      s.ballX += s.vx;
      s.ballY += s.vy;

      // Top/bottom walls bounce
      if (s.ballY <= 5 || s.ballY >= 295) {
        s.vy = -s.vy;
        sounds.playClick();
      }

      // AI follow
      if (s.ballY > s.p2Y + 35) s.p2Y += 3;
      else if (s.ballY < s.p2Y + 35) s.p2Y -= 3;
      s.p2Y = Math.max(10, Math.min(230, s.p2Y));

      // Player paddle bounce
      if (s.ballX <= 30 && s.ballY >= s.p1Y && s.ballY <= s.p1Y + 70) {
        s.vx = Math.abs(s.vx) + 0.2;
        sounds.playScore();
        s.p1Score += 1;
        setScore(s.p1Score * 50);
      }

      // AI paddle bounce
      if (s.ballX >= 370 && s.ballY >= s.p2Y && s.ballY <= s.p2Y + 70) {
        s.vx = -(Math.abs(s.vx) + 0.2);
        sounds.playClick();
      }

      // Missed player side
      if (s.ballX < 0) {
        triggerGameOver(s.p1Score * 50);
        return;
      }

      // Missed AI side
      if (s.ballX > 400) {
        s.ballX = 200;
        s.ballY = 150;
        s.vx = -4;
        s.p1Score += 2;
        setScore(s.p1Score * 50);
      }

      // Render
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Center net
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(200, 0);
      ctx.lineTo(200, 300);
      ctx.stroke();
      ctx.setLineDash([]);

      // Paddles
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(15, s.p1Y, 10, 70);

      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(375, s.p2Y, 10, 70);

      // Ball
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }, 1000 / 60);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      clearInterval(interval);
    };
  }, [isGameOver, triggerGameOver, setScore]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="rounded-xl border border-cyan-500/30 w-full max-w-lg aspect-[4/3] bg-slate-950 cursor-none shadow-lg"
    />
  );
};

/* -------------------------------------------------------------
 * 3. BRICK BREAKER NEON
 * ------------------------------------------------------------- */
const BrickBreakerGame: React.FC<GameDispatcherProps> = ({ setScore, isGameOver, triggerGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let paddleX = 160;
    const paddleWidth = 70;
    const paddleHeight = 10;
    let ballX = 200;
    let ballY = 240;
    let dx = 3;
    let dy = -3;
    const ballRadius = 5;

    let currentScore = 0;
    setScore(0);

    // Setup bricks
    const rowCount = 4;
    const colCount = 6;
    const brickWidth = 52;
    const brickHeight = 16;
    const brickPadding = 8;
    const brickOffsetTop = 30;
    const brickOffsetLeft = 20;

    const bricks: Array<Array<{ x: number; y: number; status: number; color: string }>> = [];
    const colors = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981'];

    for (let c = 0; c < colCount; c++) {
      bricks[c] = [];
      for (let r = 0; r < rowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1, color: colors[r % colors.length] };
      }
    }

    const mouseMoveHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, relativeX - paddleWidth / 2));
      }
    };

    window.addEventListener('mousemove', mouseMoveHandler);

    let animationId: number;
    const draw = () => {
      if (isGameOver) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bricks
      let remainingBricks = 0;
      for (let c = 0; c < colCount; c++) {
        for (let r = 0; r < rowCount; r++) {
          const b = bricks[c][r];
          if (b.status === 1) {
            remainingBricks++;
            const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
            const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
            b.x = brickX;
            b.y = brickY;
            ctx.fillStyle = b.color;
            ctx.fillRect(brickX, brickY, brickWidth, brickHeight);

            // Collision with ball
            if (
              ballX > brickX &&
              ballX < brickX + brickWidth &&
              ballY > brickY &&
              ballY < brickY + brickHeight
            ) {
              dy = -dy;
              b.status = 0;
              currentScore += 25;
              setScore(currentScore);
              sounds.playScore();
            }
          }
        }
      }

      if (remainingBricks === 0) {
        sounds.playLevelUp();
        triggerGameOver(currentScore + 200);
        return;
      }

      // Draw ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fill();

      // Draw paddle
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(paddleX, canvas.height - paddleHeight - 8, paddleWidth, paddleHeight);

      // Bounce walls
      if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
        dx = -dx;
        sounds.playClick();
      }
      if (ballY + dy < ballRadius) {
        dy = -dy;
        sounds.playClick();
      } else if (ballY + dy > canvas.height - paddleHeight - 8) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
          dy = -Math.abs(dy);
          // spin angle based on hit location
          dx = 6 * ((ballX - (paddleX + paddleWidth / 2)) / paddleWidth);
          sounds.playHit();
        } else if (ballY + dy > canvas.height) {
          triggerGameOver(currentScore);
          return;
        }
      }

      ballX += dx;
      ballY += dy;

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      cancelAnimationFrame(animationId);
    };
  }, [isGameOver, triggerGameOver, setScore]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={320}
      className="rounded-xl border border-pink-500/30 w-full max-w-lg aspect-[4/3] bg-slate-950 cursor-pointer shadow-lg"
    />
  );
};

/* -------------------------------------------------------------
 * 4. SPACE INVADERS 3000
 * ------------------------------------------------------------- */
const SpaceInvadersGame: React.FC<GameDispatcherProps> = ({ setScore, isGameOver, triggerGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let playerX = 180;
    const bullets: Array<{ x: number; y: number }> = [];
    const invaders: Array<{ x: number; y: number; alive: boolean }> = [];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        invaders.push({ x: 35 + c * 48, y: 30 + r * 30, alive: true });
      }
    }

    let invaderDir = 1;
    let invaderStepDown = 0;
    let currentScore = 0;
    setScore(0);

    const keys: Record<string, boolean> = {};
    const handleDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === ' ' || e.key === 'ArrowUp') {
        sounds.playLaser();
        bullets.push({ x: playerX + 18, y: 280 });
      }
    };
    const handleUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);

    let animationId: number;
    let tick = 0;

    const loop = () => {
      if (isGameOver) return;
      tick++;

      if (keys['ArrowLeft'] || keys['a']) playerX = Math.max(10, playerX - 5);
      if (keys['ArrowRight'] || keys['d']) playerX = Math.min(canvas.width - 45, playerX + 5);

      // Move invaders
      if (tick % 25 === 0) {
        let edgeHit = false;
        invaders.forEach((inv) => {
          if (!inv.alive) return;
          if ((inv.x + invaderDir * 12 > canvas.width - 35) || (inv.x + invaderDir * 12 < 15)) {
            edgeHit = true;
          }
        });

        if (edgeHit) {
          invaderDir = -invaderDir;
          invaders.forEach((inv) => (inv.y += 12));
        } else {
          invaders.forEach((inv) => (inv.x += invaderDir * 12));
        }
      }

      // Move bullets & hit detection
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= 7;
        const b = bullets[i];

        invaders.forEach((inv) => {
          if (inv.alive && b.x > inv.x && b.x < inv.x + 30 && b.y > inv.y && b.y < inv.y + 20) {
            inv.alive = false;
            bullets.splice(i, 1);
            currentScore += 30;
            setScore(currentScore);
            sounds.playHit();
          }
        });

        if (b.y < 0) bullets.splice(i, 1);
      }

      // Check invaders reach bottom
      let aliveCount = 0;
      invaders.forEach((inv) => {
        if (inv.alive) {
          aliveCount++;
          if (inv.y >= 270) {
            triggerGameOver(currentScore);
          }
        }
      });

      if (aliveCount === 0) {
        sounds.playLevelUp();
        triggerGameOver(currentScore + 300);
        return;
      }

      // Render
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Player
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(playerX, 290, 36, 12);
      ctx.fillRect(playerX + 14, 282, 8, 8);

      // Bullets
      ctx.fillStyle = '#22d3ee';
      bullets.forEach((b) => ctx.fillRect(b.x, b.y, 3, 10));

      // Invaders
      invaders.forEach((inv) => {
        if (!inv.alive) return;
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(inv.x, inv.y, 28, 16);
      });

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
      cancelAnimationFrame(animationId);
    };
  }, [isGameOver, triggerGameOver, setScore]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={320}
      className="rounded-xl border border-purple-500/30 w-full max-w-lg aspect-[4/3] bg-slate-950 shadow-lg"
    />
  );
};

/* -------------------------------------------------------------
 * 5. FLAPPY CYBER SHIP
 * ------------------------------------------------------------- */
const FlappyGame: React.FC<GameDispatcherProps> = ({ setScore, isGameOver, triggerGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let birdY = 150;
    let velocity = 0;
    const gravity = 0.28;
    const jump = -5.8;

    let currentScore = 0;
    setScore(0);

    const pipes: Array<{ x: number; top: number; bottom: number; passed: boolean }> = [
      { x: 300, top: 90, bottom: 130, passed: false },
      { x: 480, top: 120, bottom: 100, passed: false },
    ];

    const flap = () => {
      if (isGameOver) return;
      velocity = jump;
      sounds.playJump();
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') flap();
    };

    window.addEventListener('keydown', handleKey);

    let animId: number;
    const loop = () => {
      if (isGameOver) return;

      velocity += gravity;
      birdY += velocity;

      // Ground or ceiling collision
      if (birdY < 5 || birdY > canvas.height - 15) {
        triggerGameOver(currentScore);
        return;
      }

      // Move pipes
      pipes.forEach((p) => {
        p.x -= 2.2;

        if (!p.passed && p.x < 70) {
          p.passed = true;
          currentScore += 1;
          setScore(currentScore);
          sounds.playScore();
        }

        // Collision box
        if (p.x < 90 && p.x + 40 > 60) {
          if (birdY < p.top || birdY > canvas.height - p.bottom) {
            triggerGameOver(currentScore);
          }
        }
      });

      if (pipes[0].x < -50) {
        pipes.shift();
        const top = Math.floor(Math.random() * 110) + 40;
        const bottom = canvas.height - top - 110;
        pipes.push({ x: 320, top, bottom, passed: false });
      }

      // Draw
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Pipes
      ctx.fillStyle = '#06b6d4';
      pipes.forEach((p) => {
        ctx.fillRect(p.x, 0, 40, p.top);
        ctx.fillRect(p.x, canvas.height - p.bottom, 40, p.bottom);
      });

      // Bird
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(75, birdY, 12, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(animId);
    };
  }, [isGameOver, triggerGameOver, setScore]);

  return (
    <canvas
      ref={canvasRef}
      width={360}
      height={320}
      onClick={() => sounds.playJump()}
      className="rounded-xl border border-cyan-500/30 w-full max-w-sm aspect-[9/8] bg-slate-950 cursor-pointer shadow-lg"
    />
  );
};

/* -------------------------------------------------------------
 * 6. 2048 CYBER GRID
 * ------------------------------------------------------------- */
const Game2048: React.FC<GameDispatcherProps> = ({ score, setScore, triggerGameOver }) => {
  const [grid, setGrid] = useState<number[][]>([
    [0, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 2, 0],
    [0, 0, 0, 0],
  ]);

  const addRandomTile = (currentGrid: number[][]) => {
    const empty: Array<{ r: number; c: number }> = [];
    currentGrid.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val === 0) empty.push({ r, c });
      });
    });
    if (empty.length === 0) return currentGrid;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    const copy = currentGrid.map((row) => [...row]);
    copy[r][c] = Math.random() < 0.85 ? 2 : 4;
    return copy;
  };

  const moveLeft = (currentGrid: number[][]) => {
    let gained = 0;
    const newGrid = currentGrid.map((row) => {
      const res = slideAndMergeRow(row);
      gained += res.scoreGained;
      return res.newRow;
    });
    return { newGrid, gained };
  };

  const rotateClockwise = (matrix: number[][]) => {
    const N = matrix.length;
    const res: number[][] = Array.from({ length: N }, () => Array(N).fill(0));
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        res[c][N - 1 - r] = matrix[r][c];
      }
    }
    return res;
  };

  const handleMove = useCallback(
    (dir: 'left' | 'right' | 'up' | 'down') => {
      let temp = grid.map((r) => [...r]);
      let rotations = 0;

      if (dir === 'up') rotations = 3;
      if (dir === 'right') rotations = 2;
      if (dir === 'down') rotations = 1;

      for (let i = 0; i < rotations; i++) temp = rotateClockwise(temp);

      const { newGrid, gained } = moveLeft(temp);

      let reverted = newGrid;
      for (let i = 0; i < (4 - rotations) % 4; i++) reverted = rotateClockwise(reverted);

      // Check if changed
      const changed = JSON.stringify(reverted) !== JSON.stringify(grid);
      if (changed) {
        sounds.playClick();
        if (gained > 0) {
          sounds.playScore();
          setScore((prev) => prev + gained);
        }
        const withRandom = addRandomTile(reverted);
        setGrid(withRandom);
      }
    },
    [grid, setScore]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') handleMove('left');
      if (e.key === 'ArrowRight' || e.key === 'd') handleMove('right');
      if (e.key === 'ArrowUp' || e.key === 'w') handleMove('up');
      if (e.key === 'ArrowDown' || e.key === 's') handleMove('down');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleMove]);

  const tileColors: Record<number, string> = {
    2: 'bg-slate-800 text-slate-200 border-slate-700',
    4: 'bg-slate-700 text-cyan-300 border-cyan-800',
    8: 'bg-amber-900/60 text-amber-200 border-amber-600',
    16: 'bg-orange-800/80 text-orange-200 border-orange-500',
    32: 'bg-rose-900 text-rose-200 border-rose-500',
    64: 'bg-rose-700 text-white border-rose-400',
    128: 'bg-yellow-700 text-yellow-100 border-yellow-400 font-bold',
    256: 'bg-cyan-700 text-cyan-100 border-cyan-400 font-bold',
    512: 'bg-emerald-700 text-emerald-100 border-emerald-400 font-bold',
    1024: 'bg-purple-700 text-purple-100 border-purple-400 font-bold',
    2048: 'bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-slate-900 p-3 rounded-2xl border border-amber-500/30 grid grid-cols-4 gap-2.5 w-72 sm:w-80 aspect-square shadow-xl">
        {grid.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`rounded-xl border flex items-center justify-center font-cyber font-bold text-lg sm:text-2xl transition-all ${
                cell > 0 ? tileColors[cell] || 'bg-cyan-600 text-white' : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              {cell > 0 ? cell : ''}
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5 w-36 sm:hidden">
        <div />
        <button onClick={() => handleMove('up')} className="p-2.5 rounded bg-slate-800 text-white flex items-center justify-center">
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />
        <button onClick={() => handleMove('left')} className="p-2.5 rounded bg-slate-800 text-white flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button onClick={() => handleMove('down')} className="p-2.5 rounded bg-slate-800 text-white flex items-center justify-center">
          <ArrowDown className="w-5 h-5" />
        </button>
        <button onClick={() => handleMove('right')} className="p-2.5 rounded bg-slate-800 text-white flex items-center justify-center">
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 7. MINESWEEPER HOLOGRAM
 * ------------------------------------------------------------- */
const MinesweeperGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const size = 8;
  const mineCount = 10;
  const [board, setBoard] = useState<Array<{ mine: boolean; revealed: boolean; flagged: boolean; count: number }>>([]);
  const [flagMode, setFlagMode] = useState(false);

  useEffect(() => {
    // Generate mines
    const cells = Array.from({ length: size * size }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      count: 0,
    }));

    let planted = 0;
    while (planted < mineCount) {
      const idx = Math.floor(Math.random() * cells.length);
      if (!cells[idx].mine) {
        cells[idx].mine = true;
        planted++;
      }
    }

    // Compute adjacency counts
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const idx = r * size + c;
        if (cells[idx].mine) continue;
        let cCount = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
              if (cells[nr * size + nc].mine) cCount++;
            }
          }
        }
        cells[idx].count = cCount;
      }
    }

    setBoard(cells);
    setScore(0);
  }, [setScore]);

  const handleCellClick = (idx: number) => {
    if (board[idx].revealed) return;

    if (flagMode) {
      sounds.playClick();
      const copy = [...board];
      copy[idx].flagged = !copy[idx].flagged;
      setBoard(copy);
      return;
    }

    if (board[idx].flagged) return;

    if (board[idx].mine) {
      sounds.playHit();
      // Reveal all mines
      const copy = board.map((c) => (c.mine ? { ...c, revealed: true } : c));
      setBoard(copy);
      triggerGameOver(10);
      return;
    }

    // Cascade reveal
    sounds.playScore();
    const copy = [...board];
    const stack = [idx];
    let revealedGained = 0;

    while (stack.length > 0) {
      const curr = stack.pop()!;
      if (copy[curr].revealed) continue;
      copy[curr].revealed = true;
      revealedGained++;

      if (copy[curr].count === 0) {
        const r = Math.floor(curr / size);
        const c = curr % size;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
              const neighbor = nr * size + nc;
              if (!copy[neighbor].revealed && !copy[neighbor].mine) {
                stack.push(neighbor);
              }
            }
          }
        }
      }
    }

    setBoard(copy);
    setScore((prev) => prev + revealedGained * 10);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => setFlagMode(!flagMode)}
          className={`px-3 py-1.5 rounded-lg text-xs font-cyber font-bold border transition-colors cursor-pointer ${
            flagMode ? 'bg-red-600 text-white border-red-400' : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          {flagMode ? '🚩 FLAG MODE ON' : '⛏️ REVEAL MODE'}
        </button>
      </div>

      <div className="grid grid-cols-8 gap-1 p-2 bg-slate-900 rounded-xl border border-red-500/30">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded text-xs font-bold font-mono flex items-center justify-center transition-all ${
              cell.revealed
                ? cell.mine
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-slate-950 text-cyan-300 border border-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
            }`}
          >
            {cell.revealed ? (cell.mine ? '💥' : cell.count > 0 ? cell.count : '') : cell.flagged ? '🚩' : ''}
          </button>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 8. MEMORY MATRIX
 * ------------------------------------------------------------- */
const MemoryMatrixGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const symbols = ['⚡', '💎', '🚀', '🔮', '👾', '🔥', '🛡️', '🌟'];
  const [cards, setCards] = useState<Array<{ id: number; symbol: string; flipped: boolean; matched: boolean }>>([]);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    const deck = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((sym, id) => ({ id, symbol: sym, flipped: false, matched: false }));
    setCards(deck);
    setScore(0);
  }, [setScore]);

  const handleCardClick = (index: number) => {
    if (cards[index].flipped || cards[index].matched || selected.length >= 2) return;

    sounds.playClick();
    const updated = [...cards];
    updated[index].flipped = true;
    setCards(updated);

    const newSelected = [...selected, index];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      const [idx1, idx2] = newSelected;
      if (cards[idx1].symbol === cards[idx2].symbol) {
        sounds.playScore();
        updated[idx1].matched = true;
        updated[idx2].matched = true;
        setCards([...updated]);
        setSelected([]);
        setScore((prev) => prev + 50);

        // Check all matched
        if (updated.every((c) => c.matched)) {
          sounds.playLevelUp();
          triggerGameOver(400);
        }
      } else {
        setTimeout(() => {
          updated[idx1].flipped = false;
          updated[idx2].flipped = false;
          setCards([...updated]);
          setSelected([]);
        }, 800);
      }
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2.5 p-3 bg-slate-900 rounded-xl border border-cyan-500/30 max-w-sm">
      {cards.map((c, i) => (
        <button
          key={c.id}
          onClick={() => handleCardClick(i)}
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-2xl flex items-center justify-center font-bold border transition-all cursor-pointer ${
            c.flipped || c.matched
              ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-transparent'
          }`}
        >
          {c.flipped || c.matched ? c.symbol : '?'}
        </button>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------
 * 9. REACTION TIME TESTER
 * ------------------------------------------------------------- */
const ReactionTestGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [state, setState] = useState<'idle' | 'waiting' | 'ready' | 'result'>('idle');
  const [startTime, setStartTime] = useState(0);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = () => {
    setState('waiting');
    sounds.playClick();
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
      sounds.playScore();
    }, delay);
  };

  const handleClick = () => {
    if (state === 'idle') {
      startTest();
    } else if (state === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      sounds.playHit();
      setState('idle');
      alert('Too early! Wait for green.');
    } else if (state === 'ready') {
      const ms = Date.now() - startTime;
      sounds.playLevelUp();
      setReactionMs(ms);
      setState('result');
      const earned = Math.max(10, 1000 - ms);
      setScore(earned);
      triggerGameOver(earned);
    } else if (state === 'result') {
      startTest();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`w-full max-w-md h-72 rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors border select-none ${
        state === 'waiting'
          ? 'bg-rose-950/80 border-rose-500'
          : state === 'ready'
          ? 'bg-emerald-600 border-emerald-300'
          : 'bg-slate-900 border-slate-700'
      }`}
    >
      {state === 'idle' && (
        <>
          <Zap className="w-10 h-10 text-cyan-400 mb-2 animate-bounce" />
          <h3 className="text-xl font-cyber font-bold text-white">CLICK TO START</h3>
          <p className="text-xs text-slate-400 mt-1">When screen turns GREEN, click as fast as possible!</p>
        </>
      )}
      {state === 'waiting' && (
        <h3 className="text-2xl font-cyber font-bold text-rose-300 animate-pulse">
          WAIT FOR GREEN...
        </h3>
      )}
      {state === 'ready' && (
        <h3 className="text-4xl font-cyber font-black text-slate-950">
          CLICK NOW!!
        </h3>
      )}
      {state === 'result' && (
        <>
          <h3 className="text-4xl font-mono font-black text-cyan-300">{reactionMs} ms</h3>
          <p className="text-xs text-slate-300 mt-2">Click to test again</p>
        </>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * 10. COLOR MATCH BLITZ (STROOP TEST)
 * ------------------------------------------------------------- */
const ColorMatchGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const words = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE'];
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#eab308', '#a855f7'];

  const [currentWord, setCurrentWord] = useState('RED');
  const [currentColor, setCurrentColor] = useState('#ef4444');
  const [timeLeft, setTimeLeft] = useState(20);

  const nextRound = () => {
    const w = words[Math.floor(Math.random() * words.length)];
    const c = Math.random() < 0.5 ? colors[words.indexOf(w)] : colors[Math.floor(Math.random() * colors.length)];
    setCurrentWord(w);
    setCurrentColor(c);
  };

  useEffect(() => {
    nextRound();
    setScore(0);
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          triggerGameOver(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChoice = (isMatch: boolean) => {
    const actualMatch = colors[words.indexOf(currentWord)] === currentColor;
    if (isMatch === actualMatch) {
      sounds.playScore();
      setScore((s) => s + 20);
      nextRound();
    } else {
      sounds.playHit();
      setScore((s) => Math.max(0, s - 10));
      nextRound();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-slate-900 rounded-2xl border border-pink-500/30 max-w-sm w-full">
      <div className="flex justify-between w-full text-xs font-mono text-slate-400">
        <span>STROOP BLITZ</span>
        <span className="text-amber-400 font-bold">{timeLeft}s remaining</span>
      </div>

      <div className="py-8">
        <h3
          className="text-5xl font-black font-cyber tracking-widest drop-shadow-[0_0_15px_currentColor]"
          style={{ color: currentColor }}
        >
          {currentWord}
        </h3>
      </div>

      <p className="text-xs text-slate-300 text-center font-mono">
        Does the text meaning match the display ink color?
      </p>

      <div className="grid grid-cols-2 gap-3 w-full">
        <button
          onClick={() => handleChoice(true)}
          className="py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-cyber font-bold text-sm cursor-pointer active:scale-95 shadow-md shadow-emerald-500/20"
        >
          MATCH (YES)
        </button>
        <button
          onClick={() => handleChoice(false)}
          className="py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-slate-950 font-cyber font-bold text-sm cursor-pointer active:scale-95 shadow-md shadow-rose-500/20"
        >
          DIFFERENT (NO)
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 11. SPEED TYPER CYBER
 * ------------------------------------------------------------- */
const SpeedTyperGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const dictionary = ['quantum', 'matrix', 'cyber', 'neon', 'plasma', 'binary', 'protocol', 'syntax', 'orbital', 'vector', 'firewall'];
  const [currentWord, setCurrentWord] = useState('cyber');
  const [inputVal, setInputVal] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          triggerGameOver(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().trim();
    setInputVal(val);

    if (val === currentWord) {
      sounds.playScore();
      setScore((s) => s + 50);
      setInputVal('');
      const next = dictionary[Math.floor(Math.random() * dictionary.length)];
      setCurrentWord(next);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-2xl border border-cyan-500/30 max-w-sm w-full">
      <div className="flex justify-between w-full text-xs font-mono text-slate-400">
        <span>CYBER TYPER</span>
        <span className="text-cyan-400 font-bold">{timeLeft}s</span>
      </div>

      <div className="py-6">
        <h3 className="text-3xl font-cyber font-bold text-cyan-300 tracking-wider">
          {currentWord}
        </h3>
      </div>

      <input
        type="text"
        autoFocus
        value={inputVal}
        onChange={handleChange}
        placeholder="Type here..."
        className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-cyan-200 text-center font-mono text-lg focus:outline-none focus:border-cyan-400"
      />
    </div>
  );
};

/* -------------------------------------------------------------
 * 12. TIC TAC TOE AI
 * ------------------------------------------------------------- */
const TicTacToeGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));

  const checkWinner = (b: (string | null)[]) => {
    const winLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [x, y, z] of winLines) {
      if (b[x] && b[x] === b[y] && b[x] === b[z]) return b[x];
    }
    if (b.every((cell) => cell !== null)) return 'draw';
    return null;
  };

  const handleCellClick = (idx: number) => {
    if (board[idx] || checkWinner(board)) return;

    sounds.playClick();
    const newBoard = [...board];
    newBoard[idx] = 'X';
    setBoard(newBoard);

    const win = checkWinner(newBoard);
    if (win === 'X') {
      sounds.playLevelUp();
      setScore(100);
      triggerGameOver(100);
      return;
    } else if (win === 'draw') {
      sounds.playScore();
      setScore(50);
      triggerGameOver(50);
      return;
    }

    // AI move
    setTimeout(() => {
      const aiIdx = findBestTicTacToeMove(newBoard);
      if (aiIdx !== -1) {
        newBoard[aiIdx] = 'O';
        sounds.playClick();
        setBoard([...newBoard]);
        const aiWin = checkWinner(newBoard);
        if (aiWin === 'O') {
          triggerGameOver(20);
        } else if (aiWin === 'draw') {
          setScore(50);
          triggerGameOver(50);
        }
      }
    }, 300);
  };

  return (
    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900 rounded-2xl border border-cyan-500/30 w-72 aspect-square">
      {board.map((cell, idx) => (
        <button
          key={idx}
          onClick={() => handleCellClick(idx)}
          className={`rounded-xl border flex items-center justify-center font-cyber font-black text-3xl transition-all cursor-pointer ${
            cell === 'X'
              ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
              : cell === 'O'
              ? 'bg-rose-950 text-rose-300 border-rose-500'
              : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-transparent'
          }`}
        >
          {cell}
        </button>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------
 * 13. AIM TRAINER TARGET
 * ------------------------------------------------------------- */
const AimTrainerGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [target, setTarget] = useState({ x: 150, y: 150 });
  const [timeLeft, setTimeLeft] = useState(25);

  const spawnTarget = () => {
    setTarget({
      x: 30 + Math.random() * 260,
      y: 30 + Math.random() * 200,
    });
  };

  useEffect(() => {
    spawnTarget();
    setScore(0);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          triggerGameOver(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleHit = () => {
    sounds.playScore();
    setScore((s) => s + 25);
    spawnTarget();
  };

  return (
    <div className="w-full max-w-md h-72 bg-slate-950 rounded-2xl border border-red-500/30 relative overflow-hidden select-none">
      <div className="absolute top-2 left-4 text-xs font-mono text-slate-400">
        AIM TARGETS • {timeLeft}s
      </div>

      <button
        onClick={handleHit}
        className="absolute w-10 h-10 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_15px_#f43f5e] transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair active:scale-75 transition-transform"
        style={{ left: target.x, top: target.y }}
      />
    </div>
  );
};

/* -------------------------------------------------------------
 * 14. SIMON CYBER MEMORY
 * ------------------------------------------------------------- */
const SimonSoundGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const pads = [
    { id: 0, color: 'bg-cyan-500', freq: 440 },
    { id: 1, color: 'bg-emerald-500', freq: 550 },
    { id: 2, color: 'bg-amber-500', freq: 660 },
    { id: 3, color: 'bg-rose-500', freq: 770 },
  ];

  const [sequence, setSequence] = useState<number[]>([0]);
  const [userStep, setUserStep] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);

  const playSequence = (seq: number[]) => {
    seq.forEach((padId, index) => {
      setTimeout(() => {
        setActivePad(padId);
        sounds.playTone(pads[padId].freq);
        setTimeout(() => setActivePad(null), 300);
      }, (index + 1) * 600);
    });
  };

  useEffect(() => {
    playSequence(sequence);
  }, [sequence]);

  const handlePadClick = (id: number) => {
    sounds.playTone(pads[id].freq);
    if (id === sequence[userStep]) {
      if (userStep + 1 === sequence.length) {
        sounds.playLevelUp();
        setScore((s) => s + 50);
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);
        setUserStep(0);
      } else {
        setUserStep(userStep + 1);
      }
    } else {
      sounds.playGameOver();
      triggerGameOver(0);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900 rounded-2xl border border-yellow-500/30 w-72 aspect-square">
      {pads.map((p) => (
        <button
          key={p.id}
          onClick={() => handlePadClick(p.id)}
          className={`rounded-2xl transition-all cursor-pointer ${p.color} ${
            activePad === p.id ? 'brightness-150 scale-95 shadow-lg' : 'opacity-70 hover:opacity-100'
          }`}
        />
      ))}
    </div>
  );
};

/* -------------------------------------------------------------
 * 15. GEOMETRY DASH HOPPER
 * ------------------------------------------------------------- */
const GeometryJumpGame: React.FC<GameDispatcherProps> = ({ setScore, isGameOver, triggerGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cubeY = 240;
    let vy = 0;
    let isJumping = false;
    let obstacles = [{ x: 350, w: 20, h: 25 }];
    let currentScore = 0;
    setScore(0);

    const jump = () => {
      if (!isJumping) {
        vy = -9.5;
        isJumping = true;
        sounds.playJump();
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') jump();
    };

    window.addEventListener('keydown', handleKey);

    let animId: number;
    const loop = () => {
      if (isGameOver) return;

      vy += 0.45;
      cubeY += vy;
      if (cubeY >= 240) {
        cubeY = 240;
        vy = 0;
        isJumping = false;
      }

      // Move obstacles
      obstacles.forEach((obs) => {
        obs.x -= 4.5;
        // Collision check
        if (obs.x < 85 && obs.x + obs.w > 55 && cubeY + 25 > 265 - obs.h) {
          triggerGameOver(currentScore);
        }
      });

      if (obstacles[0].x < -30) {
        obstacles.shift();
        obstacles.push({ x: 380, w: 20, h: Math.random() < 0.5 ? 25 : 35 });
        currentScore += 20;
        setScore(currentScore);
        sounds.playScore();
      }

      // Render
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Floor line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 265);
      ctx.lineTo(canvas.width, 265);
      ctx.stroke();

      // Cube
      ctx.fillStyle = '#10b981';
      ctx.fillRect(60, cubeY, 25, 25);

      // Spikes
      ctx.fillStyle = '#f43f5e';
      obstacles.forEach((obs) => {
        ctx.beginPath();
        ctx.moveTo(obs.x, 265);
        ctx.lineTo(obs.x + obs.w / 2, 265 - obs.h);
        ctx.lineTo(obs.x + obs.w, 265);
        ctx.fill();
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(animId);
    };
  }, [isGameOver, triggerGameOver, setScore]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={290}
      onClick={() => sounds.playJump()}
      className="rounded-xl border border-cyan-500/30 w-full max-w-lg aspect-[4/3] bg-slate-950 cursor-pointer shadow-lg"
    />
  );
};

/* -------------------------------------------------------------
 * 16. WORDLE CYBER 5
 * ------------------------------------------------------------- */
const WordleGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const targetWord = 'CYBER';
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');

  const handleKeyInput = (char: string) => {
    if (char === 'ENTER') {
      if (currentGuess.length === 5) {
        sounds.playScore();
        const updated = [...guesses, currentGuess];
        setGuesses(updated);
        setCurrentGuess('');

        if (currentGuess === targetWord) {
          sounds.playLevelUp();
          setScore(250);
          triggerGameOver(250);
        } else if (updated.length >= 6) {
          triggerGameOver(50);
        }
      }
    } else if (char === 'DEL') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (currentGuess.length < 5) {
      sounds.playClick();
      setCurrentGuess((prev) => prev + char);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 6 Rows */}
      <div className="grid grid-rows-6 gap-1.5">
        {Array.from({ length: 6 }).map((_, rIdx) => {
          const guess = guesses[rIdx] || (rIdx === guesses.length ? currentGuess : '');
          const evaluations = guesses[rIdx] ? evaluateWordleGuess(guesses[rIdx], targetWord) : [];

          return (
            <div key={rIdx} className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 5 }).map((_, cIdx) => {
                const letter = guess[cIdx] || '';
                const status = evaluations[cIdx];
                let bg = 'bg-slate-950 border-slate-800 text-white';
                if (status === 'correct') bg = 'bg-emerald-600 border-emerald-400 text-white';
                if (status === 'present') bg = 'bg-amber-600 border-amber-400 text-white';
                if (status === 'absent') bg = 'bg-slate-800 border-slate-700 text-slate-400';

                return (
                  <div
                    key={cIdx}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg border flex items-center justify-center font-cyber font-bold text-lg ${bg}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Mini keyboard */}
      <div className="flex flex-wrap justify-center gap-1 max-w-sm mt-2">
        {'QWERTYUIOPASDFGHJKLZXCVBNM'.split('').map((char) => (
          <button
            key={char}
            onClick={() => handleKeyInput(char)}
            className="w-7 h-9 rounded bg-slate-800 text-xs font-mono font-bold text-slate-200 hover:bg-slate-700"
          >
            {char}
          </button>
        ))}
        <button
          onClick={() => handleKeyInput('DEL')}
          className="px-2 h-9 rounded bg-slate-800 text-xs font-mono font-bold text-rose-400 hover:bg-slate-700"
        >
          DEL
        </button>
        <button
          onClick={() => handleKeyInput('ENTER')}
          className="px-2 h-9 rounded bg-cyan-600 text-xs font-cyber font-bold text-slate-950 hover:bg-cyan-500"
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 17. MATH SPRINT
 * ------------------------------------------------------------- */
const MathSprintGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [problem, setProblem] = useState({ q: '12 + 18', a: 30, options: [28, 30, 32, 25] });
  const [timeLeft, setTimeLeft] = useState(30);

  const generateProblem = () => {
    const a = Math.floor(Math.random() * 20) + 5;
    const b = Math.floor(Math.random() * 20) + 5;
    const ans = a + b;
    const opts = Array.from(new Set([ans, ans + 2, ans - 3, ans + 5])).slice(0, 4);
    opts.sort(() => Math.random() - 0.5);
    setProblem({ q: `${a} + ${b}`, a: ans, options: opts });
  };

  useEffect(() => {
    generateProblem();
    setScore(0);
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          triggerGameOver(0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (val: number) => {
    if (val === problem.a) {
      sounds.playScore();
      setScore((s) => s + 20);
      generateProblem();
    } else {
      sounds.playHit();
      generateProblem();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-2xl border border-amber-500/30 max-w-sm w-full">
      <div className="flex justify-between w-full text-xs font-mono text-slate-400">
        <span>MATH SPRINT</span>
        <span className="text-amber-400 font-bold">{timeLeft}s</span>
      </div>

      <h3 className="text-4xl font-cyber font-bold text-white py-4">
        {problem.q} = ?
      </h3>

      <div className="grid grid-cols-2 gap-3 w-full">
        {problem.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt)}
            className="py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-lg font-mono font-bold text-cyan-300 border border-slate-700 cursor-pointer active:scale-95"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 18. CYBER 21 BLACKJACK
 * ------------------------------------------------------------- */
const BlackjackGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [playerHand, setPlayerHand] = useState<number[]>([10, 8]);
  const [dealerHand, setDealerHand] = useState<number[]>([10, 7]);
  const [handOver, setHandOver] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  const calcTotal = (hand: number[]) => {
    let sum = hand.reduce((a, b) => a + Math.min(b, 10), 0);
    return sum;
  };

  const handleHit = () => {
    if (handOver) return;
    sounds.playClick();
    const newCard = Math.floor(Math.random() * 10) + 1;
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    if (calcTotal(newHand) > 21) {
      sounds.playHit();
      setHandOver(true);
      setResultMsg('BUST! Dealer Wins.');
      triggerGameOver(0);
    }
  };

  const handleStand = () => {
    if (handOver) return;
    sounds.playClick();
    const pTot = calcTotal(playerHand);
    let dHand = [...dealerHand];
    while (calcTotal(dHand) < 17) {
      dHand.push(Math.floor(Math.random() * 10) + 1);
    }
    setDealerHand(dHand);
    const dTot = calcTotal(dHand);

    setHandOver(true);
    if (dTot > 21 || pTot > dTot) {
      sounds.playLevelUp();
      setResultMsg('YOU WIN!');
      setScore(100);
      triggerGameOver(100);
    } else if (pTot === dTot) {
      setResultMsg('PUSH / DRAW');
      setScore(50);
      triggerGameOver(50);
    } else {
      sounds.playHit();
      setResultMsg('DEALER WINS');
      triggerGameOver(20);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-2xl border border-emerald-500/30 max-w-sm w-full">
      <div className="text-center">
        <span className="text-xs text-slate-400 font-mono">DEALER HAND ({calcTotal(dealerHand)})</span>
        <div className="flex gap-2 justify-center mt-1">
          {dealerHand.map((c, i) => (
            <div key={i} className="w-10 h-14 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">
              {c}
            </div>
          ))}
        </div>
      </div>

      <div className="text-center my-2">
        <span className="text-xs text-slate-400 font-mono">YOUR HAND ({calcTotal(playerHand)})</span>
        <div className="flex gap-2 justify-center mt-1">
          {playerHand.map((c, i) => (
            <div key={i} className="w-10 h-14 rounded bg-emerald-950 border border-emerald-500 flex items-center justify-center font-bold text-emerald-300">
              {c}
            </div>
          ))}
        </div>
      </div>

      {resultMsg && <p className="font-cyber font-bold text-amber-300">{resultMsg}</p>}

      {!handOver && (
        <div className="flex gap-3 w-full">
          <button
            onClick={handleHit}
            className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 font-cyber font-bold text-slate-950"
          >
            HIT
          </button>
          <button
            onClick={handleStand}
            className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-cyber font-bold text-slate-950"
          >
            STAND
          </button>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * 19. KNIFE TARGET HIT
 * ------------------------------------------------------------- */
const KnifeTargetGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [knives, setKnives] = useState<number[]>([0, 120]);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => (r + 3) % 360);
    }, 20);
    return () => clearInterval(interval);
  }, []);

  const throwKnife = () => {
    sounds.playLaser();
    const currentAngle = (360 - rotation) % 360;
    // Check if overlaps within 18 deg
    const hitExisting = knives.some((k) => Math.abs(k - currentAngle) < 18);
    if (hitExisting) {
      sounds.playGameOver();
      triggerGameOver(0);
    } else {
      sounds.playScore();
      setKnives((prev) => [...prev, currentAngle]);
      setScore((s) => s + 25);
    }
  };

  return (
    <div onClick={throwKnife} className="flex flex-col items-center justify-center h-80 w-full cursor-pointer select-none">
      <div
        className="w-32 h-32 rounded-full bg-amber-900 border-4 border-amber-600 relative flex items-center justify-center shadow-lg"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <span className="text-xs font-cyber text-amber-200">CORE</span>
        {knives.map((k, i) => (
          <div
            key={i}
            className="absolute w-2 h-8 bg-cyan-400 origin-bottom -top-8"
            style={{ transform: `rotate(${k}deg)` }}
          />
        ))}
      </div>
      <p className="mt-8 text-xs text-cyan-300 font-mono">TAP TO THROW BLADE</p>
    </div>
  );
};

/* -------------------------------------------------------------
 * 20. FRUIT SLICE CYBER
 * ------------------------------------------------------------- */
const FruitSliceGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [fruit, setFruit] = useState({ x: 180, y: 150, emoji: '🍉', active: true });

  const respawn = () => {
    const emojis = ['🍉', '🍊', '🍓', '🍍', '🍇'];
    setFruit({
      x: 40 + Math.random() * 240,
      y: 40 + Math.random() * 180,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      active: true,
    });
  };

  const handleSlice = () => {
    sounds.playScore();
    setScore((s) => s + 30);
    setFruit((f) => ({ ...f, active: false }));
    setTimeout(respawn, 200);
  };

  return (
    <div
      onMouseMove={(e) => {
        // Simple slice detection
        const rect = e.currentTarget.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        if (Math.hypot(mx - fruit.x, my - fruit.y) < 35 && fruit.active) {
          handleSlice();
        }
      }}
      className="w-full max-w-md h-72 bg-slate-950 rounded-2xl border border-rose-500/30 relative overflow-hidden select-none cursor-crosshair"
    >
      <div className="absolute top-2 left-4 text-xs font-mono text-slate-400">
        SWEEP MOUSE TO SLICE FRUITS
      </div>
      {fruit.active && (
        <div
          className="absolute text-4xl transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
          style={{ left: fruit.x, top: fruit.y }}
        >
          {fruit.emoji}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------
 * 21. AIR HOCKEY NEON
 * ------------------------------------------------------------- */
const AirHockeyGame: React.FC<GameDispatcherProps> = ({ setScore }) => {
  const [playerY, setPlayerY] = useState(120);
  const [puck, setPuck] = useState({ x: 180, y: 120, vx: 3.5, vy: 2 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPuck((p) => {
        let nx = p.x + p.vx;
        let ny = p.y + p.vy;
        let nvx = p.vx;
        let nvy = p.vy;

        if (ny <= 20 || ny >= 220) nvy = -nvy;
        if (nx <= 30) {
          nvx = -nvx;
          sounds.playHit();
          setScore((s) => s + 10);
        }
        if (nx >= 330) {
          nvx = -nvx;
          sounds.playHit();
        }

        return { x: nx, y: ny, vx: nvx, vy: nvy };
      });
    }, 20);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPlayerY(Math.max(30, Math.min(210, e.clientY - rect.top)));
      }}
      className="w-full max-w-md h-64 bg-slate-950 rounded-2xl border border-sky-500/30 relative overflow-hidden select-none cursor-none"
    >
      {/* Player Mallet */}
      <div
        className="absolute w-8 h-8 rounded-full bg-cyan-400 border-2 border-white transform -translate-y-1/2 shadow-lg"
        style={{ left: 20, top: playerY }}
      />
      {/* Puck */}
      <div
        className="absolute w-6 h-6 rounded-full bg-rose-500 border border-white transform -translate-x-1/2 -translate-y-1/2 shadow-md"
        style={{ left: puck.x, top: puck.y }}
      />
      {/* AI Mallet */}
      <div
        className="absolute w-8 h-8 rounded-full bg-rose-400 border-2 border-white transform -translate-y-1/2 shadow-lg"
        style={{ right: 20, top: puck.y }}
      />
    </div>
  );
};

/* -------------------------------------------------------------
 * 22. FALLING SAND TOY
 * ------------------------------------------------------------- */
const FallingSandGame: React.FC<GameDispatcherProps> = ({ setScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTool, setSelectedTool] = useState<'sand' | 'water' | 'fire'>('sand');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 60;
    const h = 50;
    const grid = Array.from({ length: w * h }, () => 0);

    const interval = setInterval(() => {
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = h - 2; y >= 0; y--) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          if (grid[idx] === 1) {
            // Sand falls
            const below = (y + 1) * w + x;
            if (grid[below] === 0) {
              grid[below] = 1;
              grid[idx] = 0;
            }
          }
        }
      }

      // Render
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (grid[y * w + x] === 1) {
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(x * 6, y * 6, 5, 5);
          }
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedTool('sand')}
          className="px-3 py-1 rounded bg-amber-600 text-slate-950 font-cyber font-bold text-xs"
        >
          SAND PARTICLES
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={360}
        height={300}
        className="rounded-xl border border-amber-500/30 bg-slate-950 cursor-crosshair"
      />
    </div>
  );
};

/* -------------------------------------------------------------
 * 23. CROSSY STREET HOPPER
 * ------------------------------------------------------------- */
const CrossyGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [botY, setBotY] = useState(5);

  const hop = () => {
    sounds.playJump();
    setBotY((y) => {
      const ny = y - 1;
      setScore((s) => s + 20);
      if (ny <= 0) {
        sounds.playLevelUp();
        triggerGameOver(120);
        return 5;
      }
      return ny;
    });
  };

  return (
    <div onClick={hop} className="flex flex-col items-center gap-3 p-6 bg-slate-900 rounded-2xl border border-emerald-500/30 max-w-sm w-full cursor-pointer select-none">
      <h4 className="text-xs font-mono text-slate-400">HOP FORWARD ACROSS TRAFFIC</h4>
      <div className="w-full flex flex-col gap-2 my-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`h-8 rounded flex items-center justify-center ${i === botY ? 'bg-cyan-500 text-slate-950 font-bold' : i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-950'}`}>
            {i === botY ? '🤖 CYBER BOT' : i === 0 ? '🏁 SAFE ZONE' : '🚗 💨 🚗'}
          </div>
        ))}
      </div>
      <p className="text-xs text-cyan-300 font-cyber">TAP TO HOP</p>
    </div>
  );
};

/* -------------------------------------------------------------
 * 24. TECH TRIVIA QUIZ
 * ------------------------------------------------------------- */
const TriviaGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const questions = [
    { q: 'What does CPU stand for?', a: 'Central Processing Unit', opts: ['Central Processing Unit', 'Computer Power Unit', 'Core Protocol Utility', 'Cyber Pulse Unit'] },
    { q: 'In which year was the original Space Invaders released?', a: '1978', opts: ['1972', '1978', '1984', '1990'] },
    { q: 'Which programming language is known as the language of the Web?', a: 'JavaScript', opts: ['Python', 'JavaScript', 'C++', 'Fortran'] },
  ];
  const [qIdx, setQIdx] = useState(0);

  const handleAnswer = (ans: string) => {
    if (ans === questions[qIdx].a) {
      sounds.playScore();
      setScore((s) => s + 50);
      if (qIdx + 1 < questions.length) {
        setQIdx(qIdx + 1);
      } else {
        sounds.playLevelUp();
        triggerGameOver(150);
      }
    } else {
      sounds.playHit();
      triggerGameOver(20);
    }
  };

  const curr = questions[qIdx];
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-2xl border border-purple-500/30 max-w-md w-full">
      <span className="text-xs font-mono text-slate-400">TRIVIA QUESTION {qIdx + 1} / {questions.length}</span>
      <h3 className="text-lg font-cyber font-bold text-white text-center py-2">{curr.q}</h3>
      <div className="flex flex-col gap-2 w-full">
        {curr.opts.map((opt) => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt)}
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-medium text-left text-slate-200 border border-slate-700 cursor-pointer"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 25. WHACK A MOLE / CYBER BUG
 * ------------------------------------------------------------- */
const WhackAMoleGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [activeBug, setActiveBug] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBug(Math.floor(Math.random() * 9));
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const handleWhack = (idx: number) => {
    if (idx === activeBug) {
      sounds.playScore();
      setScore((s) => s + 20);
      setActiveBug(-1);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900 rounded-2xl border border-purple-500/30 w-72 aspect-square">
      {Array.from({ length: 9 }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => handleWhack(idx)}
          className={`rounded-xl border flex items-center justify-center text-2xl transition-all cursor-pointer ${
            activeBug === idx ? 'bg-rose-600 border-rose-400 scale-105' : 'bg-slate-950 border-slate-800'
          }`}
        >
          {activeBug === idx ? '👾' : ''}
        </button>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------
 * 26. 15 CYBER SLIDER
 * ------------------------------------------------------------- */
const Slider15Game: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [tiles, setTiles] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 15]);

  const slideTile = (idx: number) => {
    const emptyIdx = tiles.indexOf(0);
    const r1 = Math.floor(idx / 4), c1 = idx % 4;
    const r2 = Math.floor(emptyIdx / 4), c2 = emptyIdx % 4;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1) {
      sounds.playClick();
      const copy = [...tiles];
      copy[emptyIdx] = copy[idx];
      copy[idx] = 0;
      setTiles(copy);
      setScore((s) => s + 10);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2 p-3 bg-slate-900 rounded-2xl border border-purple-500/30 w-72 aspect-square">
      {tiles.map((val, idx) => (
        <button
          key={idx}
          onClick={() => slideTile(idx)}
          className={`rounded-lg border font-cyber font-bold text-base flex items-center justify-center ${
            val > 0 ? 'bg-slate-800 border-slate-700 text-cyan-300 cursor-pointer' : 'bg-slate-950 border-slate-900'
          }`}
        >
          {val > 0 ? val : ''}
        </button>
      ))}
    </div>
  );
};

/* -------------------------------------------------------------
 * 27. CONNECT 4 CYBER
 * ------------------------------------------------------------- */
const Connect4Game: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [board, setBoard] = useState<number[][]>(Array.from({ length: 6 }, () => Array(7).fill(0)));

  const dropDisc = (col: number) => {
    for (let r = 5; r >= 0; r--) {
      if (board[r][col] === 0) {
        sounds.playClick();
        const copy = board.map((row) => [...row]);
        copy[r][col] = 1;
        setBoard(copy);
        setScore((s) => s + 20);

        // Simple AI drop
        setTimeout(() => {
          for (let ar = 5; ar >= 0; ar--) {
            const aiCol = Math.floor(Math.random() * 7);
            if (copy[ar][aiCol] === 0) {
              copy[ar][aiCol] = 2;
              setBoard([...copy]);
              break;
            }
          }
        }, 300);
        break;
      }
    }
  };

  return (
    <div className="p-3 bg-slate-900 rounded-2xl border border-blue-500/30">
      <div className="grid grid-cols-7 gap-1.5">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <button
              key={`${r}-${c}`}
              onClick={() => dropDisc(c)}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border ${
                cell === 1 ? 'bg-cyan-400 border-cyan-200' : cell === 2 ? 'bg-rose-500 border-rose-300' : 'bg-slate-950 border-slate-800'
              }`}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------
 * 28. TOWER STACKER FULL
 * ------------------------------------------------------------- */
const TowerStackerGame: React.FC<GameDispatcherProps> = ({ setScore, triggerGameOver }) => {
  const [stackHeight, setStackHeight] = useState(1);

  const stack = () => {
    sounds.playScore();
    setStackHeight((h) => {
      const nh = h + 1;
      setScore(nh * 25);
      if (nh >= 12) {
        sounds.playLevelUp();
        triggerGameOver(300);
      }
      return nh;
    });
  };

  return (
    <div onClick={stack} className="flex flex-col-reverse items-center justify-end h-72 w-52 bg-slate-950 rounded-2xl p-3 border border-cyan-500/30 cursor-pointer gap-1">
      {Array.from({ length: stackHeight }).map((_, i) => (
        <div key={i} className="w-24 h-5 rounded bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
      ))}
    </div>
  );
};

/* -------------------------------------------------------------
 * UNIVERSAL ARCADE RUNNER (For remaining games of the 52)
 * ------------------------------------------------------------- */
const UniversalArcadeRunner: React.FC<GameDispatcherProps> = ({ gameId, setScore, triggerGameOver, accentColor }) => {
  const [energy, setEnergy] = useState(100);

  const tap = () => {
    sounds.playScore();
    setScore((s) => s + 25);
    setEnergy((e) => Math.max(0, e - 10));
    if (energy <= 10) {
      sounds.playLevelUp();
      triggerGameOver(250);
    }
  };

  return (
    <div onClick={tap} className="flex flex-col items-center justify-center gap-4 p-8 bg-slate-900 rounded-2xl border border-cyan-500/30 max-w-sm w-full cursor-pointer select-none">
      <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl animate-pulse shadow-xl" style={{ backgroundColor: accentColor }}>
        🎮
      </div>
      <h3 className="font-cyber font-bold text-lg text-white uppercase">{gameId.replace('-', ' ')}</h3>
      <p className="text-xs text-slate-400 text-center font-mono">Tap repeatedly to charge quantum energy core</p>
      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
        <div className="h-full bg-cyan-400 transition-all duration-150" style={{ width: `${energy}%` }} />
      </div>
    </div>
  );
};
