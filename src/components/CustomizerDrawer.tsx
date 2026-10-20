import React from 'react';
import { WidgetConfig, ThemePreset } from '../types';
import {
  X,
  Sliders,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Palette,
  Monitor,
  Check,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface CustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onUpdateWidgets: (widgets: WidgetConfig[]) => void;
  onResetWidgets: () => void;
  currentTheme: ThemePreset;
  onSelectTheme: (theme: ThemePreset) => void;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
}

export const CustomizerDrawer: React.FC<CustomizerDrawerProps> = ({
  isOpen,
  onClose,
  widgets,
  onUpdateWidgets,
  onResetWidgets,
  currentTheme,
  onSelectTheme,
  scanlinesEnabled,
  onToggleScanlines,
}) => {
  if (!isOpen) return null;

  const themes: Array<{ id: ThemePreset; label: string; color: string }> = [
    { id: 'cyan', label: 'Cyber Cyan', color: '#06b6d4' },
    { id: 'purple', label: 'Neon Purple', color: '#a855f7' },
    { id: 'emerald', label: 'Matrix Emerald', color: '#10b981' },
    { id: 'amber', label: 'Solar Amber', color: '#f59e0b' },
    { id: 'crimson', label: 'Rogue Crimson', color: '#f43f5e' },
  ];

  const handleToggle = (id: string) => {
    sounds.playClick();
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, enabled: !w.enabled } : w
    );
    onUpdateWidgets(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    sounds.playClick();
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= widgets.length) return;

    const copy = [...widgets];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    // re-assign orders
    const reordered = copy.map((w, i) => ({ ...w, order: i }));
    onUpdateWidgets(reordered);
  };

  const handleWidthChange = (id: string, width: 'normal' | 'wide' | 'full') => {
    sounds.playClick();
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, width } : w
    );
    onUpdateWidgets(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-950 border-l border-cyan-500/30 h-full overflow-y-auto flex flex-col p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-cyber font-bold text-white">
              Customize Dashboard
            </h2>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Close customizer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Visual Atmosphere & Themes */}
        <div className="py-4 border-b border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cyber font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-cyan-400" />
              Cyber Neon Palette
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {themes.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectTheme(t.id);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-800/80'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shadow-md"
                    style={{ backgroundColor: t.color }}
                  >
                    {isSelected && <Check className="w-3 h-3 text-slate-950 stroke-[3]" />}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono truncate w-full">
                    {t.label.split(' ')[1]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* CRT Scanline Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-purple-400" />
              <div>
                <p className="text-xs font-medium text-slate-200">CRT Retro Scanlines</p>
                <p className="text-[10px] text-slate-400">Authentic arcade display filter</p>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onToggleScanlines();
              }}
              className={`px-3 py-1 rounded text-xs font-cyber font-bold transition-colors cursor-pointer ${
                scanlinesEnabled
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_#a855f7]'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {scanlinesEnabled ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Section 2: Reorder & Toggle Widgets */}
        <div className="py-4 flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-cyber font-bold uppercase tracking-wider text-slate-300">
              Widget Layout & Order
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {widgets.filter((w) => w.enabled).length} of {widgets.length} active
            </span>
          </div>

          <div className="space-y-2">
            {widgets.map((widget, index) => (
              <div
                key={widget.id}
                className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                  widget.enabled
                    ? 'bg-slate-900/80 border-slate-700'
                    : 'bg-slate-950/50 border-slate-900 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleToggle(widget.id)}
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      widget.enabled
                        ? 'text-cyan-400 bg-cyan-950/60'
                        : 'text-slate-500 bg-slate-800'
                    }`}
                    title={widget.enabled ? 'Hide widget' : 'Show widget'}
                    aria-label={`Toggle ${widget.title}`}
                  >
                    {widget.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <span className="text-xs font-medium text-slate-200">
                    {widget.title}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Width selector */}
                  {widget.enabled && (
                    <select
                      value={widget.width}
                      onChange={(e) =>
                        handleWidthChange(widget.id, e.target.value as 'normal' | 'wide' | 'full')
                      }
                      className="bg-slate-800 border border-slate-700 text-[10px] text-slate-300 rounded px-1.5 py-1 focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="normal">1x</option>
                      <option value="wide">2x</option>
                      <option value="full">Full</option>
                    </select>
                  )}

                  {/* Reorder up/down */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      aria-label="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === widgets.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
                      aria-label="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              sounds.playClick();
              onResetWidgets();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default Layout
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-cyber font-bold text-xs cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
