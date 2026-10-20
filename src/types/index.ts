export type GameGenre = 'arcade' | 'puzzle' | 'reflex' | 'strategy' | 'casual' | 'brain';

export interface GameDefinition {
  id: string;
  title: string;
  genre: GameGenre;
  description: string;
  instructions: string;
  controls: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  icon: string; // Lucide icon name or visual symbol
  accentColor: string; // Tailwind color class or hex
  gradient: string;
  playCount: number;
  featured?: boolean;
}

export interface PlayerStats {
  username: string;
  avatar: string;
  totalXp: number;
  streakDays: number;
  lastPlayedDate: string;
  gamesPlayedCount: number;
  highScores: Record<string, number>;
  favorites: string[];
  recentGameIds: string[];
  genrePlayCounts: Record<GameGenre, number>;
  totalPlayTimeSeconds: number;
  recentScores: Array<{ gameId: string; score: number; date: string }>;
}

export type WidgetId =
  | 'hero'
  | 'radar'
  | 'quickplay'
  | 'activity'
  | 'categoryChart'
  | 'miniArcade'
  | 'achievements'
  | 'synthBeat'
  | 'luckySpin'
  | 'recommendation'
  | 'hallOfFame';

export interface WidgetConfig {
  id: WidgetId;
  title: string;
  enabled: boolean;
  order: number;
  width: 'normal' | 'wide' | 'full'; // normal = 1 col, wide = 2 cols, full = 3 cols
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export type ThemePreset = 'cyan' | 'purple' | 'emerald' | 'amber' | 'crimson';
