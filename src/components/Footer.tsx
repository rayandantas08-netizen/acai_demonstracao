import React from 'react';
import { StoreSettings } from '../types';
import { ShieldCheck, Clock, MapPin, Heart, Sparkles, MessageCircle } from 'lucide-react';

interface FooterProps {
  storeSettings: StoreSettings;
  onOpenAdmin: () => void;
  onOpenReviews: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  storeSettings,
  onOpenAdmin,
  onOpenReviews,
}) => {
  const openWhatsApp = () => {
    const cleanPhone = storeSettings.whatsappNumber.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá, ${storeSettings.storeName}! Vim pelo catálogo digital e gostaria de tirar uma dúvida.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <footer className="bg-purple-950 border-t border-purple-800/80 text-purple-200 pt-12 pb-8 mt-16 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-purple-800/60">
          {/* Col 1: Store info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-xl shadow-lg border border-amber-200/60">
                👑
              </div>
              <div>
                <h3 className="font-black text-lg text-white font-['Outfit']">
                  {storeSettings.storeName}
                </h3>
                <span className="text-[10px] text-amber-300 font-bold tracking-wider uppercase">
                  Gourmet & Artesanal
                </span>
              </div>
            </div>

            <p className="text-xs text-purple-300/90 leading-relaxed">
              {storeSettings.slogan}. Nosso compromisso é servir o açaí da mais pura cremosidade, com frutas selecionadas e doces originais.
            </p>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Site 100% Seguro (HTTPS & XSS)</span>
              </span>
            </div>
          </div>

          {/* Col 2: Horário e Localização */}
          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-sm text-white font-['Outfit'] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Horário de Atendimento</span>
            </h4>
            <p className="text-purple-300 leading-relaxed">
              {storeSettings.openingHours}
            </p>
            <div className="pt-2">
              <h4 className="font-extrabold text-sm text-white font-['Outfit'] flex items-center gap-1.5 mb-1">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Endereço / Retirada</span>
              </h4>
              <p className="text-purple-300">
                {storeSettings.address}
              </p>
            </div>
          </div>

          {/* Col 3: Links e Avaliações */}
          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-sm text-white font-['Outfit'] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Navegação Rápida</span>
            </h4>
            <ul className="space-y-2 text-purple-300">
              <li>
                <button onClick={onOpenReviews} className="hover:text-amber-300 transition-colors">
                  ⭐ Ver Avaliações dos Clientes (4.9/5.0)
                </button>
              </li>
              <li>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-amber-300 transition-colors">
                  🥤 Monte Seu Copo ou Barca
                </button>
              </li>
              <li>
                <button onClick={openWhatsApp} className="hover:text-amber-300 transition-colors flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Falar com Atendente WhatsApp</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenAdmin} className="hover:text-amber-300 transition-colors underline font-semibold text-amber-300/90">
                  ⚙️ Painel de Controle do Lojista
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Pagamento & Frete */}
          <div className="space-y-3 text-xs">
            <h4 className="font-extrabold text-sm text-white font-['Outfit']">
              Formas de Pagamento & PIX
            </h4>
            <p className="text-purple-300 leading-relaxed">
              Aceitamos <strong>PIX</strong> instantâneo, <strong>Cartão Débito/Crédito</strong> (levamos a maquininha na sua casa) e <strong>Dinheiro</strong> com troco.
            </p>
            <div className="bg-purple-900/60 p-3 rounded-2xl border border-purple-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Frete Delivery:</span>
              <span className="font-bold text-white text-xs block">
                Taxa de entrega R$ {storeSettings.deliveryFee.toFixed(2)}
              </span>
              {storeSettings.freeDeliveryThreshold > 0 && (
                <span className="text-[11px] text-emerald-400 font-semibold block">
                  🎉 Grátis em pedidos acima de R$ {storeSettings.freeDeliveryThreshold.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-400">
          <div>
            © {new Date().getFullYear()} {storeSettings.storeName}. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-2">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current animate-pulse" />
            <span className="font-bold text-amber-400">Púrpura & Ouro • Tecnologia PWA & WhatsApp</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
