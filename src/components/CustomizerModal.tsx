import React, { useState, useEffect } from 'react';
import { Product, ProductSize, AddonItem, CartAddonSelection, CartItem } from '../types';
import { formatCurrency, sanitizeString } from '../utils/sanitize';
import { X, Plus, Minus, Sparkles, Check, ShoppingBag, Layers } from 'lucide-react';

interface CustomizerModalProps {
  product: Product | null;
  allAddons: AddonItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  initialCartItem?: CartItem | null; // For editing an existing item in cart
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  product,
  allAddons,
  isOpen,
  onClose,
  onAddToCart,
  initialCartItem,
}) => {
  if (!isOpen || !product) return null;

  const [selectedSize, setSelectedSize] = useState<ProductSize | undefined>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined
  );
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'frutas' | 'doces' | 'crocantes' | 'coberturas'>('frutas');

  // Load initial cart item values if editing
  useEffect(() => {
    if (initialCartItem) {
      if (initialCartItem.selectedSize) {
        setSelectedSize(initialCartItem.selectedSize);
      }
      const addonsMap: Record<string, number> = {};
      initialCartItem.selectedAddons.forEach((sel) => {
        addonsMap[sel.addon.id] = sel.quantity;
      });
      setSelectedAddons(addonsMap);
      setNotes(initialCartItem.notes || '');
      setQuantity(initialCartItem.quantity);
    } else {
      // Reset defaults when opening fresh
      if (product.sizes && product.sizes.length > 0) {
        // Find 500ml or first
        const recommended = product.sizes.find((s) => s.name.includes('500ml')) || product.sizes[0];
        setSelectedSize(recommended);
      } else {
        setSelectedSize(undefined);
      }
      setSelectedAddons({});
      setNotes('');
      setQuantity(1);
    }
  }, [product, initialCartItem, isOpen]);

  // Group addons
  const frutas = allAddons.filter((a) => a.category === 'frutas');
  const doces = allAddons.filter((a) => a.category === 'doces');
  const crocantes = allAddons.filter((a) => a.category === 'crocantes');
  const coberturas = allAddons.filter((a) => a.category === 'coberturas');

  const getAddonListByTab = () => {
    switch (activeTab) {
      case 'frutas': return frutas;
      case 'doces': return doces;
      case 'crocantes': return crocantes;
      case 'coberturas': return coberturas;
      default: return frutas;
    }
  };

  const handleToggleAddon = (addon: AddonItem) => {
    setSelectedAddons((prev) => {
      const current = prev[addon.id] || 0;
      if (current > 0) {
        const copy = { ...prev };
        delete copy[addon.id];
        return copy;
      } else {
        return { ...prev, [addon.id]: 1 };
      }
    });
  };

  const handleIncrementAddon = (addon: AddonItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAddons((prev) => ({
      ...prev,
      [addon.id]: (prev[addon.id] || 0) + 1,
    }));
  };

  const handleDecrementAddon = (addon: AddonItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAddons((prev) => {
      const current = prev[addon.id] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[addon.id];
        return copy;
      }
      return { ...prev, [addon.id]: current - 1 };
    });
  };

  // Calculate prices
  const basePrice = selectedSize ? selectedSize.price : product.price;
  const addonsSum = Object.entries(selectedAddons).reduce((sum, [addonId, qty]) => {
    const found = allAddons.find((a) => a.id === addonId);
    return sum + (found ? found.price * qty : 0);
  }, 0);

  const unitPrice = basePrice + addonsSum;
  const totalPrice = unitPrice * quantity;

  const handleConfirmAddToCart = () => {
    // Build selectedAddons array
    const chosenAddonsList: CartAddonSelection[] = [];
    Object.entries(selectedAddons).forEach(([addonId, qty]) => {
      const found = allAddons.find((a) => a.id === addonId);
      if (found && qty > 0) {
        chosenAddonsList.push({ addon: found, quantity: qty });
      }
    });

    const newItem: CartItem = {
      id: initialCartItem ? initialCartItem.id : `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      selectedSize,
      selectedAddons: chosenAddonsList,
      notes: sanitizeString(notes),
      quantity,
      unitPrice,
      totalPrice,
    };

    onAddToCart(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-purple-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-purple-900 sm:border-2 border-amber-400/50 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Header with Product Info */}
        <div className="relative bg-purple-950 p-5 sm:p-6 border-b border-purple-800 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
            />
            <div>
              <span className="text-[10px] sm:text-xs uppercase font-extrabold text-amber-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Personalização Gourmet
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white font-['Outfit'] mt-0.5">
                {product.name}
              </h2>
              <p className="text-xs text-purple-200/80 line-clamp-1 mt-1">
                {product.description}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-purple-800/80 hover:bg-rose-500/20 text-purple-200 hover:text-rose-400 transition-colors shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Customization Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Escolha o Tamanho (Se aplicável) */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-extrabold text-white flex items-center gap-2 font-['Outfit']">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-purple-950 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <span>Escolha o Tamanho Ideal</span>
                </label>
                <span className="text-xs text-amber-300 font-semibold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Obrigatório
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize?.id === size.id;
                  return (
                    <div
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/15 scale-[1.02]'
                          : 'bg-purple-950/60 hover:bg-purple-950 border-purple-800 text-purple-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-extrabold text-sm sm:text-base text-white">
                          {size.name}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-purple-950 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-amber-300">
                        {formatCurrency(size.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Adicionais Ilimitados */}
          {product.isCustomizable && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-extrabold text-white flex items-center gap-2 font-['Outfit']">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-purple-950 flex items-center justify-center text-xs font-black">
                    {product.sizes && product.sizes.length > 0 ? '2' : '1'}
                  </span>
                  <span>Adicionais Ilimitados</span>
                </label>
                <span className="text-xs text-emerald-300 font-semibold bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>Selecione à Vontade</span>
                </span>
              </div>

              {/* Tabs for Addons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  type="button"
                  onClick={() => setActiveTab('frutas')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'frutas'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-purple-950 shadow-md'
                      : 'bg-purple-950/80 hover:bg-purple-950 text-purple-200 border border-purple-800'
                  }`}
                >
                  <span>🍓 Frutas Frescas</span>
                  <span className="text-[10px] bg-purple-950/60 px-1.5 py-0.5 rounded-full">
                    {frutas.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('doces')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'doces'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-purple-950 shadow-md'
                      : 'bg-purple-950/80 hover:bg-purple-950 text-purple-200 border border-purple-800'
                  }`}
                >
                  <span>🍫 Doces & Cremes</span>
                  <span className="text-[10px] bg-purple-950/60 px-1.5 py-0.5 rounded-full">
                    {doces.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('crocantes')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'crocantes'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-purple-950 shadow-md'
                      : 'bg-purple-950/80 hover:bg-purple-950 text-purple-200 border border-purple-800'
                  }`}
                >
                  <span>🥣 Crocantes & Ninho</span>
                  <span className="text-[10px] bg-purple-950/60 px-1.5 py-0.5 rounded-full">
                    {crocantes.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('coberturas')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 flex items-center gap-1.5 ${
                    activeTab === 'coberturas'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-purple-950 shadow-md'
                      : 'bg-purple-950/80 hover:bg-purple-950 text-purple-200 border border-purple-800'
                  }`}
                >
                  <span>🍯 Coberturas</span>
                  <span className="text-[10px] bg-purple-950/60 px-1.5 py-0.5 rounded-full">
                    {coberturas.length}
                  </span>
                </button>
              </div>

              {/* Addons Grid for Active Tab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {getAddonListByTab().map((addon) => {
                  const qty = selectedAddons[addon.id] || 0;
                  const isChecked = qty > 0;

                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleToggleAddon(addon)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-purple-950/90 border-amber-400 shadow-md'
                          : 'bg-purple-950/40 hover:bg-purple-950/70 border-purple-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                            isChecked
                              ? 'bg-amber-400 border-amber-400 text-purple-950'
                              : 'border-purple-600 bg-purple-900/50'
                          }`}
                        >
                          {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white block">
                            {addon.name}
                          </span>
                          <span className="text-xs font-semibold text-amber-300">
                            {addon.price === 0 ? 'Grátis na 1ª opção' : `+ ${formatCurrency(addon.price)}`}
                          </span>
                        </div>
                      </div>

                      {/* Quantity modifier if checked */}
                      {isChecked && (
                        <div className="flex items-center gap-2 bg-purple-900 p-1 rounded-xl border border-purple-700" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => handleDecrementAddon(addon, e)}
                            className="w-7 h-7 rounded-lg bg-purple-800 hover:bg-purple-700 text-white flex items-center justify-center font-bold"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-extrabold text-sm text-amber-300">
                            {qty}x
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleIncrementAddon(addon, e)}
                            className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-purple-950 flex items-center justify-center font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Observações */}
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-white flex items-center gap-2 font-['Outfit']">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-purple-950 flex items-center justify-center text-xs font-black">
                {product.isCustomizable && product.sizes ? '3' : product.sizes ? '2' : '1'}
              </span>
              <span>Observações do Pedido</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Caprichar na Nutella no meio do copo, sem leite em pó por cima, mandar colher extra..."
              rows={2}
              maxLength={200}
              className="w-full bg-purple-950/80 border border-purple-800 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder:text-purple-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
            />
          </div>
        </div>

        {/* Modal Bottom Footer with Quantity & Total CTA */}
        <div className="p-4 sm:p-5 bg-purple-950 border-t border-purple-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center bg-purple-900 border border-purple-700 rounded-2xl p-1.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl bg-purple-800 hover:bg-purple-700 text-white flex items-center justify-center font-bold"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="w-12 text-center font-black text-lg text-white">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-purple-950 flex items-center justify-center font-bold"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-purple-300">
                Subtotal deste item
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-['Outfit']">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>

          <button
            onClick={handleConfirmAddToCart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 font-extrabold text-base shadow-xl shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{initialCartItem ? 'Salvar Alterações' : 'Adicionar ao Carrinho'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
