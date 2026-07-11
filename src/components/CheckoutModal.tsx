import React, { useState } from 'react';
import { CartItem, StoreSettings, DeliveryMethod, PaymentMethod, CustomerData, OrderRecord } from '../types';
import { formatCurrency, formatPhone, validatePhone, sanitizeString, checkRateLimit } from '../utils/sanitize';
import { X, ShieldCheck, MapPin, CreditCard, DollarSign, QrCode, AlertCircle, CheckCircle2, MessageCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  cart: CartItem[];
  storeSettings: StoreSettings;
  deliveryMethod: DeliveryMethod;
  discountAmount: number;
  couponCode: string;
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (order: OrderRecord) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  cart,
  storeSettings,
  deliveryMethod: initialMethod,
  discountAmount,
  couponCode,
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  if (!isOpen) return null;

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(initialMethod);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [street, setStreet] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [complement, setComplement] = useState<string>('');
  const [reference, setReference] = useState<string>('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState<string>('Não precisa de troco');
  const [customChangeInput, setCustomChangeInput] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const isFreeDelivery = storeSettings.freeDeliveryThreshold > 0 && subtotal >= storeSettings.freeDeliveryThreshold;
  const deliveryFee = deliveryMethod === 'retirada' ? 0 : isFreeDelivery ? 0 : storeSettings.deliveryFee;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Sanitization & validation
    const cleanName = sanitizeString(name);
    const cleanPhone = phone.replace(/\D/g, '');

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Por favor, digite seu nome completo.');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMsg('Por favor, digite um telefone/WhatsApp válido com DDD (Ex: 11 99999-8888).');
      return;
    }

    if (deliveryMethod === 'delivery') {
      if (!street.trim() || !number.trim() || !neighborhood.trim()) {
        setErrorMsg('Para entrega no endereço (Delivery), preencha Rua, Número e Bairro.');
        return;
      }
    }

    // Rate limiting check against spam (6 seconds cooldown)
    const rateCheck = checkRateLimit('order-submit', 6000);
    if (!rateCheck.allowed) {
      setErrorMsg(`Por segurança contra disparos duplos/spam, aguarde ${rateCheck.waitSeconds}s antes de enviar o pedido novamente.`);
      return;
    }

    setIsSubmitting(true);

    // Prepare Customer Data
    const customerData: CustomerData = {
      name: cleanName,
      phone: formatPhone(cleanPhone),
      deliveryMethod,
      street: sanitizeString(street),
      number: sanitizeString(number),
      neighborhood: sanitizeString(neighborhood),
      complement: sanitizeString(complement),
      reference: sanitizeString(reference),
      paymentMethod,
      changeFor: paymentMethod === 'dinheiro' ? (customChangeInput ? `Troco para R$ ${customChangeInput}` : changeFor) : 'Não precisa',
    };

    // Format Exact WhatsApp Message
    let msg = `🍧 *NOVO PEDIDO* - ${storeSettings.storeName}\n\n`;
    msg += `👤 *Cliente:*\nNome: ${customerData.name}\n\n`;
    msg += `📞 *Telefone:*\nTelefone: ${customerData.phone}\n\n`;

    if (customerData.deliveryMethod === 'delivery') {
      msg += `📍 *Endereço:*\nRua ${customerData.street}, Nº ${customerData.number}\n`;
      msg += `Bairro: ${customerData.neighborhood}\n`;
      if (customerData.complement) msg += `Complemento: ${customerData.complement}\n`;
      if (customerData.reference) msg += `Referência: ${customerData.reference}\n`;
      msg += `\n`;
    } else {
      msg += `📍 *Forma de Entrega:*\n🏪 Retirar na Loja (Balcão)\n\n`;
    }

    msg += `🛍️ *Pedido*\n\n`;
    cart.forEach((item) => {
      msg += `• ${item.quantity}x ${item.productName}`;
      if (item.selectedSize) {
        msg += ` (${item.selectedSize.name})`;
      }
      msg += ` - ${formatCurrency(item.totalPrice)}\n`;

      if (item.selectedAddons && item.selectedAddons.length > 0) {
        msg += `Adicionais:\n`;
        item.selectedAddons.forEach((sel) => {
          const prefix = sel.quantity > 1 ? `${sel.quantity}x ` : '✔ ';
          msg += `${prefix}${sel.addon.name}\n`;
        });
      }

      if (item.notes) {
        msg += `Observação:\n${item.notes}\n`;
      }
      msg += `\n`;
    });

    msg += `Subtotal:\n${formatCurrency(subtotal)}\n\n`;
    msg += `Entrega:\n${deliveryFee === 0 ? 'R$ 0,00 (Grátis ou Retirada)' : formatCurrency(deliveryFee)}\n\n`;
    if (discountAmount > 0) {
      msg += `Desconto (${couponCode || 'Cupom'}):\n- ${formatCurrency(discountAmount)}\n\n`;
    }
    msg += `💰 *Total:*\n*${formatCurrency(total)}*\n\n`;

    msg += `Pagamento:\n${paymentMethod.toUpperCase() === 'CARTAO' ? 'Cartão na Entrega (Maquininha)' : paymentMethod.toUpperCase()}\n\n`;

    if (paymentMethod === 'dinheiro') {
      msg += `Troco:\n${customerData.changeFor}\n\n`;
    } else {
      msg += `Troco:\nNão precisa.\n\n`;
    }

    msg += `Gostaria de confirmar meu pedido e realizar o pagamento.\n\nMuito obrigado! 🍧👑`;

    // Save Order inside History / Simulate Firestore
    const newOrderRecord: OrderRecord = {
      id: `PEDIDO-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' • ' + new Date().toLocaleDateString('pt-BR'),
      customer: customerData,
      items: cart,
      subtotal,
      deliveryFee,
      discount: discountAmount,
      total,
      status: 'Pendente',
    };

    // Trigger Confetti Celebration!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#9333EA', '#FFFFFF'],
    });

    onOrderCompleted(newOrderRecord);

    // Open WhatsApp
    const storeWhatsAppClean = storeSettings.whatsappNumber.replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/${storeWhatsAppClean}?text=${encodedMsg}`;

    setTimeout(() => {
      setIsSubmitting(false);
      window.open(whatsappUrl, '_blank');
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-purple-900 border-2 border-amber-400/50 rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-5 bg-purple-950 border-b border-purple-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-['Outfit']">
                Finalizar Pedido • Envio WhatsApp
              </h3>
              <span className="text-xs text-purple-300 font-semibold">
                Ambiente Seguro HTTPS com Proteção XSS
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-600/20 border border-rose-500 text-rose-300 text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Forma de Entrega */}
          <div className="space-y-2.5">
            <label className="text-sm font-extrabold text-white flex items-center gap-2 font-['Outfit']">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-purple-950 flex items-center justify-center text-xs font-black">1</span>
              <span>Opção de Recebimento</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryMethod('delivery')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  deliveryMethod === 'delivery'
                    ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/15'
                    : 'bg-purple-950/60 border-purple-800 text-purple-300 hover:bg-purple-950'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    🛵 Delivery na Porta
                  </span>
                  {deliveryMethod === 'delivery' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <span className="text-xs text-amber-300 font-bold">
                  Taxa: {storeSettings.deliveryFee === 0 || isFreeDelivery ? 'GRÁTIS' : formatCurrency(storeSettings.deliveryFee)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMethod('retirada')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  deliveryMethod === 'retirada'
                    ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/15'
                    : 'bg-purple-950/60 border-purple-800 text-purple-300 hover:bg-purple-950'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    🏪 Retirar na Loja
                  </span>
                  {deliveryMethod === 'retirada' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>
                <span className="text-xs text-emerald-400 font-bold">
                  R$ 0,00 • Sem taxa de entrega
                </span>
              </button>
            </div>
          </div>

          {/* Step 2: Dados do Cliente */}
          <div className="space-y-3">
            <label className="text-sm font-extrabold text-white flex items-center gap-2 font-['Outfit']">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-purple-950 flex items-center justify-center text-xs font-black">2</span>
              <span>Dados do Cliente</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-purple-300 font-semibold block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Ana Clara Silva"
                  required
                  className="w-full bg-purple-950/80 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-purple-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs text-purple-300 font-semibold block mb-1">Telefone / WhatsApp *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(XX) 9XXXX-XXXX"
                  required
                  maxLength={15}
                  className="w-full bg-purple-950/80 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-purple-400 focus:outline-none focus:border-amber-400 font-mono font-bold"
                />
              </div>
            </div>

            {/* Address inputs only if Delivery */}
            {deliveryMethod === 'delivery' && (
              <div className="space-y-3 pt-2 border-t border-purple-800/60 animate-fadeIn">
                <span className="text-xs uppercase font-extrabold text-amber-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Endereço de Entrega Completo</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-purple-300 font-semibold block mb-1">Rua / Avenida *</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Ex: Rua das Flores"
                      required
                      className="w-full bg-purple-950/80 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-purple-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-purple-300 font-semibold block mb-1">Número *</label>
                    <input
                      type="text"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      placeholder="Ex: 450"
                      required
                      className="w-full bg-purple-950/80 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-purple-400 focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-purple-300 font-semibold block mb-1">Bairro *</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Centro / Bela Vista"
                      required
                      className="w-full bg-purple-950/80 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-purple-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-purple-300 font-semibold block mb-1">Complemento</label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Ex: Apto 12B / Bloco 3 / Casa 2"
                      className="w-full bg-purple-950/80 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-purple-400 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1">Ponto de Referência (Opcional)</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: Próximo ao supermercado, portão preto"
                    className="w-full bg-purple-950/80 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-purple-400 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Forma de Pagamento */}
          <div className="space-y-3">
            <label className="text-sm font-extrabold text-white flex items-center gap-2 font-['Outfit']">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-purple-950 flex items-center justify-center text-xs font-black">3</span>
              <span>Forma de Pagamento na Entrega/Retirada</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'pix'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md scale-105'
                    : 'bg-purple-950/60 border-purple-800 text-purple-300 hover:bg-purple-950'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="font-extrabold text-xs">PIX</span>
                <span className="text-[10px] opacity-80">Rápido e Seguro</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao')}
                className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'cartao'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                    : 'bg-purple-950/60 border-purple-800 text-purple-300 hover:bg-purple-950'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-extrabold text-xs">Cartão</span>
                <span className="text-[10px] opacity-80">Débito / Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('dinheiro')}
                className={`p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  paymentMethod === 'dinheiro'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md scale-105'
                    : 'bg-purple-950/60 border-purple-800 text-purple-300 hover:bg-purple-950'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span className="font-extrabold text-xs">Dinheiro</span>
                <span className="text-[10px] opacity-80">Troco na mão</span>
              </button>
            </div>

            {/* PIX instructions prompt */}
            {paymentMethod === 'pix' && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/40 text-xs text-emerald-200 space-y-1">
                <div className="font-extrabold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chave PIX da Loja ({storeSettings.pixType})</span>
                </div>
                <div className="font-mono bg-purple-950/90 p-2 rounded-xl text-amber-300 font-bold select-all">
                  {storeSettings.pixKey}
                </div>
                <p className="text-[11px] text-purple-200 mt-1">
                  * Ao finalizar, você será direcionado ao nosso WhatsApp. Basta nos enviar o comprovante do PIX na conversa!
                </p>
              </div>
            )}

            {/* Dinheiro instructions prompt ("Troco para quanto?") */}
            {paymentMethod === 'dinheiro' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 space-y-3 animate-fadeIn">
                <span className="text-xs font-extrabold text-amber-300 block">
                  Troco para quanto? Selecione ou digite o valor:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Para R$ 50,00', 'Para R$ 100,00', 'Para R$ 200,00', 'Não precisa de troco'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setChangeFor(opt);
                        setCustomChangeInput('');
                      }}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        changeFor === opt && !customChangeInput
                          ? 'bg-amber-400 text-purple-950 border-amber-300 font-black shadow-sm'
                          : 'bg-purple-950 text-purple-200 border-purple-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs text-purple-200 whitespace-nowrap">Ou outro valor (R$):</span>
                  <input
                    type="number"
                    value={customChangeInput}
                    onChange={(e) => {
                      setCustomChangeInput(e.target.value);
                      setChangeFor(`Para R$ ${e.target.value}`);
                    }}
                    placeholder="Ex: 80,00"
                    className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Summary Box */}
          <div className="bg-purple-950 border border-purple-800 rounded-2xl p-4 text-xs space-y-1.5 text-purple-200">
            <div className="flex justify-between">
              <span>Total do Pedido ({cart.length} itens):</span>
              <span className="font-bold text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Entrega ({deliveryMethod === 'retirada' ? 'Retirada no Balcão' : 'Delivery'}):</span>
              <span className="font-bold text-emerald-400">{deliveryFee === 0 ? 'GRÁTIS' : formatCurrency(deliveryFee)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Desconto de Cupom:</span>
                <span>- {formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="border-t border-purple-800 pt-2 flex justify-between items-center text-base sm:text-lg font-black text-white">
              <span>Total a Pagar:</span>
              <span className="text-amber-400 font-['Outfit']">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-500 text-purple-950 font-black text-base shadow-xl shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <MessageCircle className="w-6 h-6 fill-current text-purple-950" />
              <span>
                {isSubmitting ? 'Gerando Pedido WhatsApp...' : 'Finalizar Pedido • Enviar no WhatsApp'}
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-center text-[11px] text-purple-300 mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Ao clicar, o WhatsApp abrirá automaticamente com a mensagem organizada para o atendente confirmar o pagamento.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
