import React, { useState, useMemo } from 'react';
import { GameDefinition, GameGenre } from '../types';
import { CATEGORIES } from '../data/gamesCatalog';
import { sounds } from '../utils/soundEffects';
import {
  Play,
  Star,
  Trophy,
  Shuffle,
  Gamepad2,
  Sparkles,
  Zap,
  Grid,
  Clock,
  Shield,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface GamesGridProps {
  games: GameDefinition[];
  onPlayGame: (game: GameDefinition) => void;
  favorites: string[];
  onToggleFavorite: (gameId: string) => void;
  highScores: Record<string, number>;
  searchQuery: string;
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}

export const GamesGrid: React.FC<GamesGridProps> = ({
  games,
  onPlayGame,
  favorites,
  onToggleFavorite,
  highScores,
  searchQuery,
  selectedCategory,
  onSelectCategory,
}) => {
  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesCategory =
        selectedCategory === 'all' || game.genre === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        game.title.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query) ||
        game.tags.some((t) => t.toLowerCase().includes(query)) ||
        game.genre.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [games, selectedCategory, searchQuery]);

  const handleRandomPick = () => {
    sounds.playLaser();
    const pool = filteredGames.length > 0 ? filteredGames : games;
    const randomGame = pool[Math.floor(Math.random() * pool.length)];
    onPlayGame(randomGame);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-4 h-4" />;
      case 'Grid':
        return <Grid className="w-4 h-4" />;
      case 'Clock':
        return <Clock className="w-4 h-4" />;
      case 'Shield':
        return <Shield className="w-4 h-4" />;
      case 'Layers':
        return <Layers className="w-4 h-4" />;
      case 'HelpCircle':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <Gamepad2 className="w-4 h-4" />;
    }
  };

  return (
    <section className="space-y-6 pt-4">
      {/* Category Pills & Random Picker Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Category Horizontal Scroll Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectCategory(cat.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-cyber font-bold tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25 border border-cyan-400'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Surprise Me Button */}
        <button
          onClick={handleRandomPick}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-cyber font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
        >
          <Shuffle className="w-4 h-4" />
          <span>RANDOM SURPRISE</span>
        </button>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
        <span>
          Showing <strong className="text-cyan-400">{filteredGames.length}</strong> instant playable games
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        <span className="hidden sm:inline">100% Free • Click any game to play instantly</span>
      </div>

      {/* Grid of Games */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGames.map((game) => {
            const isFav = favorites.includes(game.id);
            const best = highScores[game.id] || 0;

            return (
              <div
                key={game.id}
                className="group relative rounded-2xl border border-slate-800/90 hover:border-cyan-500/50 bg-slate-950/80 hover:bg-slate-900/90 p-4 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-cyan-500/10 backdrop-blur-md overflow-hidden"
              >
                {/* Background ambient gradient pulse on hover */}
                <div
                  className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-300"
                  style={{ backgroundColor: game.accentColor }}
                />

                <div>
                  {/* Top Row: Category tag, difficulty, favorite toggle */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: game.accentColor }}
                      />
                      <span className="text-[11px] font-cyber font-bold text-slate-300 uppercase">
                        {game.genre}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 font-mono">
                        {game.difficulty}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playClick();
                        onToggleFavorite(game.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        isFav
                          ? 'text-amber-400 bg-amber-950/50'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={isFav ? 'Remove favorite' : 'Add to favorites'}
                      aria-label={`Favorite ${game.title}`}
                    >
                      <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="font-cyber font-bold text-lg text-white group-hover:text-cyan-300 transition-colors mb-1.5 line-clamp-1">
                    {game.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                    {game.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {game.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Score & Play Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between mt-auto">
                  <div className="text-xs font-mono">
                    {best > 0 ? (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        Best: {best}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Unplayed</span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onPlayGame(game);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600/30 group-hover:bg-cyan-500 text-cyan-200 group-hover:text-slate-950 font-cyber font-bold text-xs border border-cyan-500/40 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-cyber font-bold text-slate-300">
            No games found matching "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500">
            Try adjusting your search query or selecting a different category filter.
          </p>
          <button
            onClick={() => onSelectCategory('all')}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 font-cyber font-bold cursor-pointer"
          >
            VIEW ALL 52 GAMES
          </button>
        </div>
      )}
    </section>
  );
};
