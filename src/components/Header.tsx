import React from 'react';
import { StoreSettings, CartItem } from '../types';
import { formatCurrency } from '../utils/sanitize';
import { 
  ShoppingBag, 
  Clock, 
  Settings, 
  Sun, 
  Moon, 
  ShieldCheck, 
  MessageCircle, 
  Heart
} from 'lucide-react';

interface HeaderProps {
  storeSettings: StoreSettings;
  cart: CartItem[];
  favoritesCount: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onShowFavorites: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeSettings,
  cart,
  favoritesCount,
  theme,
  onToggleTheme,
  onOpenCart,
  onOpenAdmin,
  onShowFavorites
}) => {
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  const openQuickWhatsApp = () => {
    const cleanPhone = storeSettings.whatsappNumber.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá, ${storeSettings.storeName}! Gostaria de tirar uma dúvida ou fazer meu pedido.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-purple-950/90 border-b border-amber-500/30 backdrop-blur-md shadow-lg shadow-purple-950/50' 
        : 'bg-purple-900/95 border-b border-amber-400/40 backdrop-blur-md shadow-md text-white'
    }`}>
      {/* Top Status Bar */}
      <div className="bg-purple-900/60 border-b border-purple-800/60 px-3 py-1.5 text-xs text-purple-200">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-medium">
              <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                storeSettings.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
              }`} />
              {storeSettings.isOpen ? 'Loja Aberta • Recebendo Pedidos' : 'Loja Fechada Temporariamente'}
            </span>
            <span className="hidden sm:inline-block opacity-40">|</span>
            <span className="hidden sm:flex items-center gap-1 text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              {storeSettings.openingHours}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:flex items-center gap-1 text-emerald-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Catálogo Seguro com Proteção XSS & HTTPS
            </span>
            <button
              onClick={openQuickWhatsApp}
              className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-0.5 rounded-full transition-all duration-200 shadow-sm hover:scale-105"
              title="Falar direto no WhatsApp da Loja"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>Dúvidas no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo & Store Name */}
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 transform group-hover:rotate-6 transition-all duration-300 border-2 border-amber-200/60">
              <span className="text-2xl animate-float">👑</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-purple-900 border border-amber-400 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
              🍧
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 font-['Outfit']">
                {storeSettings.storeName}
              </h1>
              <span className="hidden lg:inline-block bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                Gourmet Premium
              </span>
            </div>
            <p className="text-xs text-purple-200/80 hidden sm:block max-w-sm truncate">
              {storeSettings.slogan}
            </p>
          </div>
        </div>

        {/* Quick Delivery Info Badges (Tablet/Desktop) */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="bg-purple-900/60 border border-purple-700/60 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-purple-300 text-[10px] uppercase font-semibold">Tempo Médio</span>
            <span className="font-bold text-amber-300">{storeSettings.avgDeliveryTime}</span>
          </div>
          <div className="bg-purple-900/60 border border-purple-700/60 px-3 py-1.5 rounded-xl text-center">
            <span className="block text-purple-300 text-[10px] uppercase font-semibold">Taxa Entrega</span>
            <span className="font-bold text-emerald-300">{formatCurrency(storeSettings.deliveryFee)}</span>
          </div>
        </div>

        {/* Action Buttons Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Favorites trigger */}
          <button
            onClick={onShowFavorites}
            className="relative p-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-purple-200 hover:text-amber-300 transition-all duration-200"
            title="Meus Açaís Favoritos"
          >
            <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-700 text-amber-300 transition-all duration-200"
            title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Admin Toggle */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/80 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs transition-all duration-200"
            title="Painel Administrativo da Loja"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Painel Lojista</span>
          </button>

          {/* Floating Cart Button */}
          <button
            onClick={onOpenCart}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl font-bold transition-all duration-300 shadow-lg ${
              totalItemsCount > 0
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 hover:scale-105 shadow-amber-500/30 border border-amber-200 animate-pulse'
                : 'bg-purple-900/80 hover:bg-purple-800 text-purple-100 border border-purple-700'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-purple-950 text-amber-300 border border-amber-400 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </div>
            <div className="text-left leading-none hidden sm:block">
              <span className="block text-[10px] uppercase font-semibold opacity-80">
                {totalItemsCount === 0 ? 'Carrinho' : `${totalItemsCount} ${totalItemsCount === 1 ? 'item' : 'itens'}`}
              </span>
              <span className="text-xs font-black">
                {formatCurrency(cartSubtotal)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
