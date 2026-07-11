import React from 'react';
import { Product } from '../types';
import { formatCurrency } from '../utils/sanitize';
import { Heart, Plus, Sparkles, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
}) => {
  return (
    <div className={`group relative rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between border ${
      product.isGoldGourmet 
        ? 'bg-gradient-to-b from-purple-900/90 to-purple-950 border-2 border-amber-400/60 shadow-xl shadow-purple-950/80 hover:shadow-amber-500/20 hover:-translate-y-1' 
        : 'bg-purple-900/60 hover:bg-purple-900/80 border-purple-800/80 hover:border-amber-400/40 shadow-lg hover:-translate-y-1'
    }`}>
      {/* Top Image Section */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-purple-950">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            !product.isAvailable ? 'grayscale opacity-60' : ''
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-transparent to-purple-950/30" />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product.id);
          }}
          className="absolute top-3.5 right-3.5 w-9 h-9 rounded-full bg-purple-950/80 backdrop-blur-md border border-amber-400/40 flex items-center justify-center text-rose-400 hover:scale-110 transition-transform shadow-md z-10"
          title="Adicionar / Remover dos Favoritos"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500 animate-bounce' : 'text-purple-200'}`} />
        </button>

        {/* Badges Left */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
          {product.badge && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-purple-950 text-[10px] sm:text-xs font-black tracking-wide uppercase shadow-lg border border-amber-200 flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3 fill-current" />
              {product.badge}
            </span>
          )}

          {product.isBestSeller && !product.badge && (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-md">
              🔥 Mais Vendido
            </span>
          )}

          {!product.isAvailable && (
            <span className="px-3 py-1 rounded-full bg-rose-600/95 text-white text-xs font-extrabold shadow-lg flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              ESGOTADO HOJE
            </span>
          )}
        </div>

        {/* Customizable Indicator Bottom Left of Photo */}
        {product.isCustomizable && product.isAvailable && (
          <div className="absolute bottom-2.5 left-3.5 bg-purple-950/90 backdrop-blur-md border border-amber-400/50 px-2.5 py-1 rounded-xl text-[10px] text-amber-300 font-bold flex items-center gap-1">
            <span>🎨 Monte do Seu Jeito</span>
          </div>
        )}
      </div>

      {/* Middle Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors font-['Outfit']">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-purple-200/80 mt-1.5 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Footer & Price & CTA */}
        <div className="pt-3 border-t border-purple-800/60 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase font-semibold text-purple-300">
              {product.isCustomizable && product.sizes ? 'A partir de' : 'Preço Normal'}
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-400">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            onClick={() => product.isAvailable && onSelectProduct(product)}
            disabled={!product.isAvailable}
            className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 shadow-md ${
              !product.isAvailable
                ? 'bg-purple-900/40 text-purple-400 border border-purple-800 cursor-not-allowed'
                : product.isCustomizable
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 hover:scale-105 shadow-amber-500/25 border border-amber-200'
                : 'bg-purple-800 hover:bg-amber-500 hover:text-purple-950 text-white border border-purple-600 hover:border-amber-400'
            }`}
          >
            {product.isCustomizable ? (
              <>
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Personalizar</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 shrink-0" />
                <span>Adicionar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
