/**
 * Pure logic calculations for NovaArcade:
 * Leveling, Skill Radar calculation, 2048 logic, Wordle logic, Tic-Tac-Toe AI.
 */

export interface SkillStats {
  speed: number;
  reflex: number;
  logic: number;
  strategy: number;
  precision: number;
  endurance: number;
}

export interface PlayerProgress {
  xp: number;
  level: number;
  title: string;
  nextLevelXp: number;
  currentLevelBaseXp: number;
  progressPercent: number;
}

export function calculatePlayerProgress(totalXp: number): PlayerProgress {
  const safeXp = Math.max(0, totalXp);
  // Exponential progression curve: level N requires 100 * N^1.5 XP
  let level = 1;
  let accumulated = 0;
  
  while (true) {
    const xpNeededForNext = Math.round(150 * Math.pow(level, 1.4));
    if (safeXp < accumulated + xpNeededForNext) {
      const currentLevelBaseXp = accumulated;
      const nextLevelXp = accumulated + xpNeededForNext;
      const progressPercent = Math.min(
        100,
        Math.max(0, Math.round(((safeXp - currentLevelBaseXp) / xpNeededForNext) * 100))
      );

      const titles = [
        'Cadet Gamer',
        'Arcade Novice',
        'Pixel Explorer',
        'Cyber Scout',
        'Neon Striker',
        'Byte Commander',
        'Quantum Tactician',
        'Cyber Champion',
        'Matrix Master',
        'Grandmaster Apex',
        'Living Legend'
      ];
      const titleIndex = Math.min(titles.length - 1, Math.floor((level - 1) / 3));

      return {
        xp: safeXp,
        level,
        title: titles[titleIndex],
        nextLevelXp,
        currentLevelBaseXp,
        progressPercent,
      };
    }
    accumulated += xpNeededForNext;
    level++;
  }
}

export interface GamePlayLog {
  genre: 'arcade' | 'puzzle' | 'reflex' | 'strategy' | 'casual' | 'brain';
  score: number;
  durationSeconds: number;
}

export function computeSkillProfile(logs: GamePlayLog[]): SkillStats {
  const baseline: SkillStats = {
    speed: 40,
    reflex: 40,
    logic: 40,
    strategy: 40,
    precision: 40,
    endurance: 40,
  };

  if (!logs || logs.length === 0) return baseline;

  let totalDuration = 0;
  let reflexPlays = 0;
  let logicPlays = 0;
  let strategyPlays = 0;
  let arcadePlays = 0;
  let brainPlays = 0;
  let casualPlays = 0;

  for (const log of logs) {
    totalDuration += log.durationSeconds;
    if (log.genre === 'reflex') reflexPlays++;
    else if (log.genre === 'puzzle') logicPlays++;
    else if (log.genre === 'strategy') strategyPlays++;
    else if (log.genre === 'arcade') arcadePlays++;
    else if (log.genre === 'brain') brainPlays++;
    else if (log.genre === 'casual') casualPlays++;
  }

  // Derive normalized scores (bounded 20..100)
  const clamp = (val: number) => Math.min(100, Math.max(20, Math.round(val)));

  return {
    speed: clamp(40 + (reflexPlays * 6) + (brainPlays * 4)),
    reflex: clamp(40 + (reflexPlays * 8) + (arcadePlays * 4)),
    logic: clamp(40 + (logicPlays * 8) + (brainPlays * 5)),
    strategy: clamp(40 + (strategyPlays * 9) + (logicPlays * 3)),
    precision: clamp(40 + (arcadePlays * 6) + (reflexPlays * 4) + (casualPlays * 3)),
    endurance: clamp(40 + Math.min(50, totalDuration / 60) + (logs.length * 2)),
  };
}

// 2048 slide and merge 1D row logic
export function slideAndMergeRow(row: number[]): { newRow: number[]; scoreGained: number } {
  const nonZeros = row.filter((val) => val !== 0);
  const result: number[] = [];
  let scoreGained = 0;

  let i = 0;
  while (i < nonZeros.length) {
    if (i + 1 < nonZeros.length && nonZeros[i] === nonZeros[i + 1]) {
      const mergedVal = nonZeros[i] * 2;
      result.push(mergedVal);
      scoreGained += mergedVal;
      i += 2;
    } else {
      result.push(nonZeros[i]);
      i += 1;
    }
  }

  while (result.length < row.length) {
    result.push(0);
  }

  return { newRow: result, scoreGained };
}

// Wordle evaluation logic
export type WordleStatus = 'correct' | 'present' | 'absent';

export function evaluateWordleGuess(guess: string, target: string): WordleStatus[] {
  const g = guess.toUpperCase();
  const t = target.toUpperCase();
  const len = target.length;
  const result: WordleStatus[] = Array(len).fill('absent');
  const targetCounts: Record<string, number> = {};

  // Count target chars
  for (let i = 0; i < len; i++) {
    const char = t[i];
    targetCounts[char] = (targetCounts[char] || 0) + 1;
  }

  // First pass: mark correct
  for (let i = 0; i < len; i++) {
    if (g[i] === t[i]) {
      result[i] = 'correct';
      targetCounts[g[i]]--;
    }
  }

  // Second pass: mark present
  for (let i = 0; i < len; i++) {
    if (result[i] !== 'correct') {
      const char = g[i];
      if (targetCounts[char] && targetCounts[char] > 0) {
        result[i] = 'present';
        targetCounts[char]--;
      }
    }
  }

  return result;
}

// Smart Tic-Tac-Toe move finder
export function findBestTicTacToeMove(board: (string | null)[]): number {
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  // 1. Can AI ('O') win in one move?
  for (const [a, b, c] of winLines) {
    if (board[a] === 'O' && board[b] === 'O' && board[c] === null) return c;
    if (board[a] === 'O' && board[c] === 'O' && board[b] === null) return b;
    if (board[b] === 'O' && board[c] === 'O' && board[a] === null) return a;
  }

  // 2. Can Player ('X') win in one move? Block it!
  for (const [a, b, c] of winLines) {
    if (board[a] === 'X' && board[b] === 'X' && board[c] === null) return c;
    if (board[a] === 'X' && board[c] === 'X' && board[b] === null) return b;
    if (board[b] === 'X' && board[c] === 'X' && board[a] === null) return a;
  }

  // 3. Take center if available
  if (board[4] === null) return 4;

  // 4. Take corners
  const corners = [0, 2, 6, 8].filter((idx) => board[idx] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Take any empty spot
  const emptySpots = board
    .map((val, idx) => (val === null ? idx : null))
    .filter((v): v is number => v !== null);
  return emptySpots[0] ?? -1;
}
