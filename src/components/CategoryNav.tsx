import React from 'react';
import { Category } from '../types';
import { Search, Sparkles, Heart, Flame, CheckCircle2, X } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterAvailableOnly: boolean;
  onToggleAvailableOnly: () => void;
  filterBestSellersOnly: boolean;
  onToggleBestSellersOnly: () => void;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  filterAvailableOnly,
  onToggleAvailableOnly,
  filterBestSellersOnly,
  onToggleBestSellersOnly,
  showFavoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
}) => {
  return (
    <div className="bg-purple-950/90 border-y border-purple-800/80 sticky top-[73px] sm:top-[76px] z-30 backdrop-blur-md py-4 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pesquisar por Nutella, Barca, Copo 500ml, Ninho, Paçoca..."
              className="w-full bg-purple-900/80 border border-purple-700/80 focus:border-amber-400 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-purple-300/60 focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters Pill Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onToggleBestSellersOnly}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                filterBestSellersOnly
                  ? 'bg-amber-500 text-purple-950 border-amber-300 shadow-md shadow-amber-500/25 scale-105'
                  : 'bg-purple-900/80 hover:bg-purple-800 text-purple-200 border-purple-700'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Mais Vendidos</span>
            </button>

            <button
              onClick={onToggleFavoritesOnly}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                showFavoritesOnly
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/25 scale-105'
                  : 'bg-purple-900/80 hover:bg-purple-800 text-purple-200 border-purple-700'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              <span>Favoritos ({favoritesCount})</span>
            </button>

            <button
              onClick={onToggleAvailableOnly}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                filterAvailableOnly
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/25'
                  : 'bg-purple-900/80 hover:bg-purple-800 text-purple-200 border-purple-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Disponíveis na Hora</span>
            </button>
          </div>
        </div>

        {/* Categories Tabs Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
          <button
            onClick={() => {
              onSelectCategory('all');
              onToggleFavoritesOnly();
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border shrink-0 ${
              selectedCategory === 'all' && !showFavoritesOnly
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 border-amber-200 shadow-lg shadow-amber-500/30 scale-105'
                : 'bg-purple-900/70 hover:bg-purple-800 text-purple-200 border-purple-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>🌟 Cardápio Completo</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id && !showFavoritesOnly;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 border-amber-200 shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-purple-900/70 hover:bg-purple-800 text-purple-200 border-purple-800 hover:border-amber-400/40'
                }`}
              >
                <span className="text-base leading-none">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
