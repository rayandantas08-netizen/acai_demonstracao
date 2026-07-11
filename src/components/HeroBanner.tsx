import React from 'react';
import { StoreSettings } from '../types';
import { formatCurrency } from '../utils/sanitize';
import { Star, Sparkles, Clock, Truck, ChevronRight, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  storeSettings: StoreSettings;
  onScrollToCategory: (categoryId: string) => void;
  onOpenReviews: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  storeSettings,
  onScrollToCategory,
  onOpenReviews,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-purple-950 via-purple-900/90 to-purple-950/40 border-b border-purple-800/60 pt-6 pb-12 sm:py-12">
      {/* Decorative Background Glowing Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs sm:text-sm font-semibold shadow-inner">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>O Legítimo Açaí Gourmet Artesanal Púrpura & Ouro</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white font-['Outfit']">
              Monte o Seu <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200">
                Açaí dos Sonhos
              </span>{' '}
              sem Limites
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-purple-200/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Escolha seu tamanho ideal, adicione camadas infinitas de <strong className="text-amber-300 font-semibold">Nutella, Leite Ninho, Morango fresco e crocantes</strong>. Ao finalizar, enviamos o resumo perfeito direto para nosso WhatsApp com confirmação imediata!
            </p>

            {/* Store Quick Info Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-900/80 border border-purple-700/80 text-xs sm:text-sm text-purple-100 shadow-sm">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Tempo Médio: <strong className="text-amber-300 font-semibold">{storeSettings.avgDeliveryTime}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-900/80 border border-purple-700/80 text-xs sm:text-sm text-purple-100 shadow-sm">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Entrega: <strong className="text-emerald-300 font-semibold">{formatCurrency(storeSettings.deliveryFee)}</strong>
                  {storeSettings.freeDeliveryThreshold > 0 && (
                    <span className="text-[11px] text-purple-300 ml-1">
                      (Grátis +{formatCurrency(storeSettings.freeDeliveryThreshold)})
                    </span>
                  )}
                </span>
              </div>

              <div 
                onClick={onOpenReviews}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-xs sm:text-sm text-amber-300 cursor-pointer transition-all duration-200 shadow-sm hover:scale-105"
              >
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="font-bold">4.9</span>
                <span className="text-purple-200/80 underline text-xs">(3.400+ avaliações)</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-4">
              <button
                onClick={() => onScrollToCategory('copos-montados')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 font-extrabold text-base shadow-xl shadow-amber-500/25 hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>🍧 Montar Meu Açaí Agora</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onScrollToCategory('barcas')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-purple-900/90 hover:bg-purple-800 text-white font-bold text-base border border-purple-700/80 shadow-md hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>🚤 Barcas Imperiais</span>
              </button>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Gold Shimmer Card */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-purple-900/90 to-purple-950 border-2 border-amber-400/40 shadow-2xl shadow-purple-950 group">
                {/* Image */}
                <div className="relative h-64 sm:h-72 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=1000&q=80"
                    alt="Açaí Gourmet Supremo Ouro"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-950/30 to-transparent" />
                  
                  {/* Floating Top Pill */}
                  <div className="absolute top-4 left-4 bg-purple-950/90 backdrop-blur-md border border-amber-400/50 px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-amber-300 shadow-lg">
                    <span>👑 Destaque do Chef</span>
                  </div>

                  <div className="absolute top-4 right-4 bg-emerald-600/95 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Pronto para Envio</span>
                  </div>
                </div>

                {/* Card Info Bottom */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-lg sm:text-xl text-white">
                      Copo Açaí Supremo Gourmet
                    </h3>
                    <span className="text-amber-400 font-black text-lg">
                      a partir de R$ 16,00
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/80 leading-relaxed">
                    Você escolhe as camadas de Nutella, Leite Condensado, Morango e Crocantes. Perfeito para seu lanche ou sobremesa!
                  </p>
                  <button
                    onClick={() => onScrollToCategory('copos-montados')}
                    className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-purple-950 border border-amber-400/50 font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    <span>Montar o Meu Agora</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
