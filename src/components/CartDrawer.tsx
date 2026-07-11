import React, { useState } from 'react';
import { CartItem, StoreSettings, DeliveryMethod } from '../types';
import { formatCurrency } from '../utils/sanitize';
import { ShoppingBag, Trash2, Edit3, Plus, Minus, ArrowRight, X, Sparkles, AlertCircle } from 'lucide-react';

interface CartDrawerProps {
  cart: CartItem[];
  storeSettings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (item: CartItem) => void;
  onProceedToCheckout: (deliveryMethod: DeliveryMethod, discount: number, couponCode: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  storeSettings,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onEditItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string>('');

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Delivery fee logic
  const isFreeDelivery = storeSettings.freeDeliveryThreshold > 0 && subtotal >= storeSettings.freeDeliveryThreshold;
  const deliveryFee = deliveryMethod === 'retirada' ? 0 : isFreeDelivery ? 0 : storeSettings.deliveryFee;

  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();

    if (!code) return;

    if (code === 'ACAI10') {
      const disc = Math.min(subtotal * 0.1, 15);
      setDiscountAmount(disc);
      setAppliedCoupon('ACAI10 (10% OFF)');
      setCouponInput('');
    } else if (code === 'OURO2026') {
      setDiscountAmount(5.00);
      setAppliedCoupon('OURO2026 (-R$ 5,00)');
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido ou expirado. Tente "ACAI10" ou "OURO2026".');
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountAmount(0);
    setAppliedCoupon('');
    setCouponInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-purple-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-purple-900 h-full shadow-2xl flex flex-col border-l border-amber-400/40">
        {/* Header */}
        <div className="p-5 bg-purple-950 border-b border-purple-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-['Outfit']">
                Seu Carrinho de Açaí
              </h3>
              <span className="text-xs text-purple-300">
                {cart.length === 0 ? 'O carrinho está vazio' : `${cart.length} itens selecionados`}
              </span>
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
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-20 h-20 rounded-full bg-purple-950 border-2 border-purple-800 flex items-center justify-center text-3xl">
                🍧
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-white">Seu carrinho está vazio</h4>
                <p className="text-xs text-purple-300 max-w-xs mt-1">
                  Explore nosso cardápio de copos montados, barcas imperiais e milk shakes para começar!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-purple-950 font-extrabold text-xs tracking-wider uppercase shadow-md hover:scale-105 transition-transform"
              >
                Voltar ao Cardápio
              </button>
            </div>
          ) : (
            <>
              {/* Delivery / Retirada Toggle Pill inside Cart */}
              <div className="bg-purple-950/80 p-1.5 rounded-2xl border border-purple-800 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('delivery')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    deliveryMethod === 'delivery'
                      ? 'bg-amber-500 text-purple-950 shadow-md'
                      : 'text-purple-200 hover:bg-purple-900/60'
                  }`}
                >
                  🛵 Receber por Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('retirada')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    deliveryMethod === 'retirada'
                      ? 'bg-amber-500 text-purple-950 shadow-md'
                      : 'text-purple-200 hover:bg-purple-900/60'
                  }`}
                >
                  🏪 Retirar na Loja (R$ 0)
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-purple-950/70 border border-purple-800/80 rounded-2xl p-4 space-y-3 transition-all hover:border-amber-400/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-14 h-14 rounded-xl object-cover border border-amber-400/40 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-sm text-white truncate">
                              {item.productName}
                            </h4>
                          </div>
                          {item.selectedSize && (
                            <span className="inline-block text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md mt-1">
                              Tamanho: {item.selectedSize.name}
                            </span>
                          )}

                          {/* Selected Addons breakdown */}
                          {item.selectedAddons && item.selectedAddons.length > 0 && (
                            <div className="mt-2 text-xs text-purple-200/90 space-y-0.5 bg-purple-900/40 p-2 rounded-xl border border-purple-800/60">
                              <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">Adicionais:</span>
                              {item.selectedAddons.map((sel, idx) => (
                                <div key={idx} className="flex items-center justify-between text-[11px]">
                                  <span>• {sel.quantity > 1 ? `${sel.quantity}x ` : '✔ '}{sel.addon.name}</span>
                                  {sel.addon.price > 0 && (
                                    <span className="text-purple-300">+{formatCurrency(sel.addon.price * sel.quantity)}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {item.notes && (
                            <p className="mt-1.5 text-xs italic text-amber-200/80 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                              Obs: "{item.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Actions Bar */}
                    <div className="pt-2 border-t border-purple-800/60 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg bg-purple-900 hover:bg-purple-800 text-purple-200 flex items-center justify-center border border-purple-700"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-black text-sm text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg bg-purple-900 hover:bg-purple-800 text-purple-200 flex items-center justify-center border border-purple-700"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-amber-400 mr-2">
                          {formatCurrency(item.totalPrice)}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onEditItem(item);
                          }}
                          className="p-1.5 rounded-lg bg-purple-900/80 hover:bg-amber-500/20 text-purple-300 hover:text-amber-300 transition-colors"
                          title="Editar Item no Carrinho"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          className="p-1.5 rounded-lg bg-purple-900/80 hover:bg-rose-500/20 text-purple-300 hover:text-rose-400 transition-colors"
                          title="Excluir Item do Carrinho"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Section */}
              <div className="bg-purple-950/70 border border-purple-800 rounded-2xl p-3.5 space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Possui um Cupom de Desconto?</span>
                </span>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-emerald-500/15 border border-emerald-400/40 p-2.5 rounded-xl text-xs text-emerald-300 font-bold">
                    <span>🎉 Cupom Ativo: {appliedCoupon}</span>
                    <button onClick={handleRemoveCoupon} className="text-purple-300 hover:text-white underline text-[11px]">
                      Remover
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Ex: ACAI10 ou OURO2026"
                      className="flex-1 bg-purple-900/80 border border-purple-700 rounded-xl px-3 py-1.5 text-xs text-white uppercase placeholder:normal-case focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-purple-800 hover:bg-amber-500 hover:text-purple-950 text-white font-bold text-xs transition-colors"
                    >
                      Aplicar
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {couponError}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-5 bg-purple-950 border-t border-purple-800 space-y-3">
            <div className="space-y-1.5 text-xs text-purple-200">
              <div className="flex justify-between">
                <span>Subtotal dos itens:</span>
                <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Taxa de entrega ({deliveryMethod === 'retirada' ? 'Retirada no balcão' : 'Delivery'}):</span>
                <span className={`font-bold ${deliveryFee === 0 ? 'text-emerald-400' : 'text-white'}`}>
                  {deliveryFee === 0 ? 'GRÁTIS R$ 0,00' : formatCurrency(deliveryFee)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Desconto de Cupom:</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="border-t border-purple-800 pt-2 flex justify-between items-center text-base sm:text-lg font-black text-white">
                <span>Total Geral:</span>
                <span className="text-amber-400 font-['Outfit']">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onProceedToCheckout(deliveryMethod, discountAmount, appliedCoupon);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 font-extrabold text-base shadow-xl shadow-amber-500/30 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              <span>Finalizar Pedido Agora</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
