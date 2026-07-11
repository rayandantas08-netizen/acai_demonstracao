import React from 'react';
import { CustomerReview } from '../types';
import { Star, CheckCircle2, X, MessageSquareQuote } from 'lucide-react';

interface ReviewsCarouselProps {
  reviews: CustomerReview[];
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewsCarousel: React.FC<ReviewsCarouselProps> = ({
  reviews,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-purple-900 border-2 border-amber-400/40 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-purple-950/90 border-b border-purple-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-['Outfit']">
                Avaliações dos Clientes
              </h3>
              <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold">
                <span>⭐ 4.9 de 5.0 estrelas</span>
                <span className="text-purple-300 font-normal">| Mais de 3.400 pedidos verificados</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-purple-800/80 hover:bg-rose-500/20 text-purple-200 hover:text-rose-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4 text-xs sm:text-sm text-purple-100 flex items-start gap-3">
            <MessageSquareQuote className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block mb-0.5">Sua opinião é fundamental para nossa realeza!</strong>
              Nós prezamos pelo açaí da mais alta cremosidade e frutas 100% selecionadas no dia. Todas as avaliações abaixo foram coletadas após entregas bem-sucedidas.
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-purple-950/70 border border-purple-800/80 rounded-2xl p-4 sm:p-5 space-y-3 transition-all hover:border-amber-400/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/60"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{rev.name}</span>
                        {rev.verified && (
                          <span className="flex items-center gap-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Verificado
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-purple-300 block">{rev.date}</span>
                    </div>
                  </div>

                  <div className="flex text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed italic bg-purple-900/40 p-3 rounded-xl border border-purple-800/40">
                  "{rev.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-purple-950/95 border-t border-purple-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-transform"
          >
            Voltar ao Catálogo e Fazer Pedido 🍧
          </button>
        </div>
      </div>
    </div>
  );
};
