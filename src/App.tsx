/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  GameDefinition,
  PlayerStats,
  WidgetConfig,
  Achievement,
  ThemePreset,
  GameGenre,
} from './types';
import {
  GAMES_CATALOG,
  INITIAL_WIDGETS,
  INITIAL_ACHIEVEMENTS,
} from './data/gamesCatalog';
import {
  calculatePlayerProgress,
  computeSkillProfile,
  GamePlayLog,
} from './utils/gameRules';
import { sounds } from './utils/soundEffects';

import { CyberBackground } from './components/CyberBackground';
import { Header } from './components/Header';
import { GamesGrid } from './components/GamesGrid';
import { GameModal } from './components/GameModal';
import { CustomizerDrawer } from './components/CustomizerDrawer';

import {
  SkillRadarChart,
  CategoryDonutChart,
  PlayActivityHeatmap,
  LevelProgressDisplay,
} from './components/DataVisualizations';

import { HeroFeaturedWidget } from './components/widgets/HeroFeaturedWidget';
import { MiniArcadeWidget } from './components/widgets/MiniArcadeWidget';
import { SynthBeatWidget } from './components/widgets/SynthBeatWidget';
import { LuckySpinWidget } from './components/widgets/LuckySpinWidget';
import { RecommendationWidget } from './components/widgets/RecommendationWidget';
import { HallOfFameWidget } from './components/widgets/HallOfFameWidget';
import { QuickPlayWidget } from './components/widgets/QuickPlayWidget';
import { AchievementsWidget } from './components/widgets/AchievementsWidget';

import { Sparkles, Trophy, Zap, Sliders, Gamepad2, Info } from 'lucide-react';

const STORAGE_KEY_STATS = 'nova_arcade_player_stats_v2';
const STORAGE_KEY_WIDGETS = 'nova_arcade_widgets_v2';
const STORAGE_KEY_ACHIEVEMENTS = 'nova_arcade_achievements_v2';
const STORAGE_KEY_THEME = 'nova_arcade_theme_v2';
const STORAGE_KEY_SCANLINES = 'nova_arcade_scanlines_v2';

export default function App() {
  // Theme and display state
  const [theme, setTheme] = useState<ThemePreset>('cyan');
  const [scanlinesEnabled, setScanlinesEnabled] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Active game in modal
  const [activeGame, setActiveGame] = useState<GameDefinition | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'xp' | 'trophy' | 'level' } | null>(null);

  // Player stats state
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      username: 'CyberPilot_X',
      avatar: 'zap',
      totalXp: 380,
      streakDays: 4,
      lastPlayedDate: new Date().toISOString(),
      gamesPlayedCount: 12,
      highScores: {
        snake: 180,
        pong: 250,
        '2048': 1024,
        'flappy-cyber': 14,
        'reaction-test': 225,
      },
      favorites: ['snake', '2048', 'reaction-test'],
      recentGameIds: ['snake', 'pong', '2048'],
      genrePlayCounts: {
        arcade: 6,
        puzzle: 4,
        reflex: 5,
        strategy: 2,
        casual: 3,
        brain: 2,
      },
      totalPlayTimeSeconds: 1450,
      recentScores: [
        { gameId: 'snake', score: 180, date: '2026-10-18' },
        { gameId: '2048', score: 1024, date: '2026-10-19' },
        { gameId: 'reaction-test', score: 225, date: '2026-10-20' },
      ],
    };
  });

  // Widget layout state
  const [widgets, setWidgets] = useState<WidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WIDGETS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_WIDGETS;
  });

  // Achievements state
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACHIEVEMENTS;
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(playerStats));
    } catch {}
  }, [playerStats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WIDGETS, JSON.stringify(widgets));
    } catch {}
  }, [widgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACHIEVEMENTS, JSON.stringify(achievements));
    } catch {}
  }, [achievements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {}
  }, [theme]);

  // Handle URL query parameters (e.g. ?game=snake or ?autostart=1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const gameParam = params.get('game');
      const autostart = params.get('autostart');

      if (gameParam) {
        const found = GAMES_CATALOG.find((g) => g.id === gameParam);
        if (found) setActiveGame(found);
      } else if (autostart === '1') {
        setActiveGame(GAMES_CATALOG[0]); // Autostart Retro Snake
      }
    }
  }, []);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'xp' | 'trophy' | 'level' = 'xp') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Unlock achievement helper
  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements((prev) => {
      const target = prev.find((a) => a.id === achievementId);
      if (target && !target.unlocked) {
        sounds.playLevelUp();
        showToast(`🏆 UNLOCKED: ${target.title} (+${target.xpReward} XP)`, 'trophy');
        setPlayerStats((stats) => ({
          ...stats,
          totalXp: stats.totalXp + target.xpReward,
        }));
        return prev.map((a) =>
          a.id === achievementId ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
        );
      }
      return prev;
    });
  }, [showToast]);

  // Derived calculations
  const progress = useMemo(() => calculatePlayerProgress(playerStats.totalXp), [playerStats.totalXp]);

  const skillProfile = useMemo(() => {
    const logs: GamePlayLog[] = [];
    (Object.keys(playerStats.genrePlayCounts) as GameGenre[]).forEach((genre) => {
      const count = playerStats.genrePlayCounts[genre] || 0;
      for (let i = 0; i < count; i++) {
        logs.push({ genre, score: 100, durationSeconds: 60 });
      }
    });
    return computeSkillProfile(logs);
  }, [playerStats.genrePlayCounts]);

  // Featured and recommended games
  const featuredGame = useMemo(
    () => GAMES_CATALOG.find((g) => g.id === 'snake') || GAMES_CATALOG[0],
    []
  );

  const recommendedGame = useMemo(() => {
    // Find unplayed or least played genre
    const genres: GameGenre[] = ['arcade', 'puzzle', 'reflex', 'strategy', 'casual', 'brain'];
    const leastPlayedGenre = [...genres].sort(
      (a, b) => (playerStats.genrePlayCounts[a] || 0) - (playerStats.genrePlayCounts[b] || 0)
    )[0];
    const candidate =
      GAMES_CATALOG.find((g) => g.genre === leastPlayedGenre && !playerStats.highScores[g.id]) ||
      GAMES_CATALOG.find((g) => g.genre === leastPlayedGenre) ||
      GAMES_CATALOG[1];
    return {
      game: candidate,
      reason: `Boost your ${leastPlayedGenre.toUpperCase()} skill rating!`,
    };
  }, [playerStats.genrePlayCounts, playerStats.highScores]);

  // Handlers
  const handlePlayGame = (game: GameDefinition) => {
    setActiveGame(game);
    // Mark first boot achievement
    unlockAchievement('first_blood');
  };

  const handleGameOver = (gameId: string, score: number, xpEarned: number) => {
    const game = GAMES_CATALOG.find((g) => g.id === gameId);
    const genre = game ? game.genre : 'arcade';

    setPlayerStats((prev) => {
      const currentHigh = prev.highScores[gameId] || 0;
      const nextHigh = Math.max(currentHigh, score);
      const nextRecent = [gameId, ...prev.recentGameIds.filter((id) => id !== gameId)].slice(0, 6);

      const nextGenreCounts = {
        ...prev.genrePlayCounts,
        [genre]: (prev.genrePlayCounts[genre] || 0) + 1,
      };

      // Check polymath (played all 6 genres)
      const allGenresPlayed = (Object.keys(nextGenreCounts) as GameGenre[]).every(
        (g) => nextGenreCounts[g] > 0
      );
      if (allGenresPlayed) unlockAchievement('polymath');

      // Check high scorer
      if (score >= 1000) unlockAchievement('high_scorer');

      // Check reaction test speed demon
      if (gameId === 'reaction-test' && score >= 750) unlockAchievement('speed_demon');

      showToast(`+${xpEarned} XP Earned! Run Completed`, 'xp');

      return {
        ...prev,
        totalXp: prev.totalXp + xpEarned,
        gamesPlayedCount: prev.gamesPlayedCount + 1,
        highScores: { ...prev.highScores, [gameId]: nextHigh },
        recentGameIds: nextRecent,
        genrePlayCounts: nextGenreCounts,
      };
    });
  };

  const handleToggleFavorite = (gameId: string) => {
    setPlayerStats((prev) => {
      const isFav = prev.favorites.includes(gameId);
      const nextFavs = isFav
        ? prev.favorites.filter((id) => id !== gameId)
        : [...prev.favorites, gameId];
      return { ...prev, favorites: nextFavs };
    });
  };

  const handleRewardXp = (xp: number, message: string) => {
    setPlayerStats((prev) => ({ ...prev, totalXp: prev.totalXp + xp }));
    showToast(message, 'xp');
    unlockAchievement('lucky_roller');
  };

  const handleResetWidgets = () => {
    setWidgets(INITIAL_WIDGETS);
    showToast('Dashboard widgets restored to default layout.', 'xp');
  };

  // Render individual widget component
  const renderWidget = (widget: WidgetConfig) => {
    switch (widget.id) {
      case 'hero':
        return (
          <HeroFeaturedWidget
            game={featuredGame}
            onPlay={handlePlayGame}
            highScore={playerStats.highScores[featuredGame.id]}
          />
        );
      case 'miniArcade':
        return (
          <MiniArcadeWidget
            onScoreEarned={(score, xp) => {
              setPlayerStats((prev) => ({
                ...prev,
                totalXp: prev.totalXp + xp,
              }));
              showToast(`+${xp} XP from Mini Stacker!`, 'xp');
            }}
          />
        );
      case 'radar':
        return (
          <div className="glass-panel rounded-xl p-4 flex flex-col justify-between h-full border border-cyan-500/20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Player Skill Radar
              </h3>
              <span className="text-[10px] text-cyan-300 font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800">
                DYNAMIC
              </span>
            </div>
            <div className="my-2 flex-1 flex items-center justify-center">
              <SkillRadarChart stats={skillProfile} themeColor="#06b6d4" />
            </div>
          </div>
        );
      case 'activity':
        return (
          <div className="glass-panel rounded-xl p-4 flex flex-col justify-between h-full border border-emerald-500/20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Play Activity & Level Progression
              </h3>
              <span className="text-[10px] text-emerald-300 font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <div className="my-3 space-y-4">
              <LevelProgressDisplay progress={progress} />
              <PlayActivityHeatmap
                streakDays={playerStats.streakDays}
                totalPlays={playerStats.gamesPlayedCount}
              />
            </div>
          </div>
        );
      case 'categoryChart':
        return (
          <div className="glass-panel rounded-xl p-4 flex flex-col justify-between h-full border border-purple-500/20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-cyber font-bold text-sm text-white flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-purple-400" />
                Play Distribution
              </h3>
              <span className="text-[10px] text-purple-300 font-mono px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800">
                GENRES
              </span>
            </div>
            <div className="my-3">
              <CategoryDonutChart
                genreCounts={playerStats.genrePlayCounts}
                onSelectGenre={(genre) => setSelectedCategory(genre)}
              />
            </div>
          </div>
        );
      case 'synthBeat':
        return <SynthBeatWidget />;
      case 'luckySpin':
        return <LuckySpinWidget onReward={handleRewardXp} />;
      case 'recommendation':
        return (
          <RecommendationWidget
            recommendedGame={recommendedGame.game}
            onPlay={handlePlayGame}
            reason={recommendedGame.reason}
          />
        );
      case 'hallOfFame':
        return (
          <HallOfFameWidget
            highScores={playerStats.highScores}
            onPlayGame={(id) => {
              const g = GAMES_CATALOG.find((game) => game.id === id);
              if (g) handlePlayGame(g);
            }}
          />
        );
      case 'quickplay':
        return (
          <QuickPlayWidget
            favorites={playerStats.favorites}
            recentGameIds={playerStats.recentGameIds}
            onPlayGame={handlePlayGame}
          />
        );
      case 'achievements':
        return <AchievementsWidget achievements={achievements} />;
      default:
        return null;
    }
  };

  const getColSpanClass = (width: 'normal' | 'wide' | 'full') => {
    switch (width) {
      case 'wide':
        return 'col-span-1 md:col-span-2';
      case 'full':
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      default:
        return 'col-span-1';
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-slate-950">
      {/* Interactive Particle Background Canvas */}
      <CyberBackground theme={theme} />

      {/* CRT Scanline Overlay Effect if enabled */}
      {scanlinesEnabled && (
        <div className="cyber-scanlines fixed inset-0 z-30 pointer-events-none" />
      )}

      {/* Header HUD */}
      <Header
        progress={progress}
        streakDays={playerStats.streakDays}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        isMuted={isMuted}
        onToggleMute={() => {
          const next = !isMuted;
          sounds.setMuted(next);
          setIsMuted(next);
        }}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => setScanlinesEnabled(!scanlinesEnabled)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenTrophies={() => setIsCustomizerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8 relative z-10">
        {/* Customizable Widgets Grid */}
        <section aria-label="Customizable Dashboard Widgets">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="font-cyber font-bold text-lg text-white tracking-wide">
                CYBER DECK DASHBOARD
              </h2>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                setIsCustomizerOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-cyber font-bold cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>CUSTOMIZE VIEW</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {widgets
              .filter((w) => w.enabled)
              .map((w) => (
                <div key={w.id} className={getColSpanClass(w.width)}>
                  {renderWidget(w)}
                </div>
              ))}
          </div>
        </section>

        {/* 50+ Games Catalog Section */}
        <GamesGrid
          games={GAMES_CATALOG}
          onPlayGame={handlePlayGame}
          favorites={playerStats.favorites}
          onToggleFavorite={handleToggleFavorite}
          highScores={playerStats.highScores}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-6 text-center text-xs text-slate-500 font-mono relative z-10">
        <p className="flex items-center justify-center gap-2">
          <span>NovaArcade v2.4</span>
          <span>•</span>
          <span>52 Instant Playable Web Games</span>
          <span>•</span>
          <span>Zero Sign-up Required</span>
          <span>•</span>
          <span>100% Free Forever</span>
        </p>
      </footer>

      {/* Active Game Modal Cabinet */}
      {activeGame && (
        <GameModal
          game={activeGame}
          onClose={() => setActiveGame(null)}
          onGameOver={handleGameOver}
          currentHighScore={playerStats.highScores[activeGame.id] || 0}
        />
      )}

      {/* Customizer Drawer */}
      <CustomizerDrawer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        widgets={widgets}
        onUpdateWidgets={(newWidgets) => {
          setWidgets(newWidgets);
          unlockAchievement('architect');
        }}
        onResetWidgets={handleResetWidgets}
        currentTheme={theme}
        onSelectTheme={setTheme}
        scanlinesEnabled={scanlinesEnabled}
        onToggleScanlines={() => setScanlinesEnabled(!scanlinesEnabled)}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-cyan-400 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom duration-300">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-xs font-cyber font-bold tracking-wide">
            {toast.message}
          </span>
        </div>
      )}
    </div>
  );
}
