import React, { useState } from 'react';
import { Product, Category, StoreSettings, OrderRecord, AddonItem } from '../types';
import { formatCurrency, sanitizeString } from '../utils/sanitize';
import { getGoogleSheetsApiUrl, setGoogleSheetsApiUrl, fetchAllFromGoogleSheets } from '../services/googleSheets';
import { 
  X, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Edit3, 
  Settings, 
  Package, 
  Phone, 
  Clock, 
  Truck, 
  DollarSign, 
  Check, 
  Sparkles, 
  MessageCircle, 
  Layers, 
  RotateCcw,
  Database,
  Copy,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  addons: AddonItem[];
  storeSettings: StoreSettings;
  orders: OrderRecord[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateStoreSettings: (newSettings: StoreSettings) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleProductAvailability: (productId: string) => void;
  onUpdateAddonPrice: (addonId: string, newPrice: number) => void;
  onAddAddon: (addon: AddonItem) => void;
  onDeleteAddon: (addonId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderRecord['status']) => void;
  onResetFactoryData: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  categories,
  addons,
  storeSettings,
  orders,
  isOpen,
  onClose,
  onUpdateStoreSettings,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleProductAvailability,
  onUpdateAddonPrice,
  onAddAddon,
  onDeleteAddon,
  onUpdateOrderStatus,
  onResetFactoryData,
}) => {
  if (!isOpen) return null;

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'addons' | 'orders' | 'sheets'>('products');

  // Product editing/creation state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState<string>('');
  const [prodDesc, setProdDesc] = useState<string>('');
  const [prodPrice, setProdPrice] = useState<number>(18);
  const [prodImage, setProdImage] = useState<string>('https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80');
  const [prodCategory, setProdCategory] = useState<any>('copos-montados');
  const [prodCustomizable, setProdCustomizable] = useState<boolean>(true);
  const [prodBestSeller, setProdBestSeller] = useState<boolean>(false);
  const [prodGoldGourmet, setProdGoldGourmet] = useState<boolean>(false);
  const [prodBadge, setProdBadge] = useState<string>('');

  // Settings temp state
  const [tempSettings, setTempSettings] = useState<StoreSettings>({ ...storeSettings });
  const [settingsSavedMessage, setSettingsSavedMessage] = useState<boolean>(false);

  // New Addon state
  const [newAddonName, setNewAddonName] = useState<string>('');
  const [newAddonPrice, setNewAddonPrice] = useState<number>(3.5);
  const [newAddonCat, setNewAddonCat] = useState<'frutas' | 'doces' | 'crocantes' | 'coberturas'>('doces');

  // Google Sheets state
  const [sheetsUrlInput, setSheetsUrlInput] = useState<string>(() => getGoogleSheetsApiUrl());
  const [sheetsTestStatus, setSheetsTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [sheetsMessage, setSheetsMessage] = useState<string>('');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (usernameInput === 'admin' && passwordInput === 'acai2026') {
      setIsLoggedIn(true);
    } else {
      setLoginError('Credenciais incorretas! (Dica Demo: login "admin" | senha "acai2026")');
    }
  };

  const handleQuickDemoLogin = () => {
    setIsLoggedIn(true);
  };

  const handleOpenProductModalForNew = () => {
    setEditingProduct(null);
    setProdName('');
    setProdDesc('');
    setProdPrice(22.00);
    setProdImage('https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80');
    setProdCategory('copos-montados');
    setProdCustomizable(true);
    setProdBestSeller(false);
    setProdGoldGourmet(false);
    setProdBadge('');
  };

  const handleOpenProductModalForEdit = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdDesc(prod.description);
    setProdPrice(prod.price);
    setProdImage(prod.image);
    setProdCategory(prod.categoryId);
    setProdCustomizable(prod.isCustomizable);
    setProdBestSeller(!!prod.isBestSeller);
    setProdGoldGourmet(!!prod.isGoldGourmet);
    setProdBadge(prod.badge || '');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const newProd: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: sanitizeString(prodName),
      description: sanitizeString(prodDesc),
      price: Number(prodPrice) || 0,
      image: prodImage || 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
      categoryId: prodCategory,
      isCustomizable: prodCustomizable,
      isAvailable: editingProduct ? editingProduct.isAvailable : true,
      isBestSeller: prodBestSeller,
      isGoldGourmet: prodGoldGourmet,
      badge: prodBadge ? sanitizeString(prodBadge) : undefined,
      sizes: prodCustomizable
        ? [
            { id: 's-300', name: '300ml', price: Number(prodPrice) - 6 },
            { id: 's-500', name: '500ml', price: Number(prodPrice) },
            { id: 's-700', name: '700ml', price: Number(prodPrice) + 7 },
            { id: 's-1000', name: '1 Litro', price: Number(prodPrice) + 17 },
          ]
        : undefined,
    };

    if (editingProduct) {
      onUpdateProduct(newProd);
    } else {
      onAddProduct(newProd);
    }
    setEditingProduct(null);
    setProdName('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings(tempSettings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  const handleCreateAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonName.trim()) return;
    const newAdd: AddonItem = {
      id: `add-${Date.now()}`,
      name: sanitizeString(newAddonName),
      price: Number(newAddonPrice) || 0,
      category: newAddonCat,
    };
    onAddAddon(newAdd);
    setNewAddonName('');
  };

  const handleSaveSheetsUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setSheetsTestStatus('testing');
    setSheetsMessage('Conectando à planilha e verificando abas...');
    setGoogleSheetsApiUrl(sheetsUrlInput);

    const data = await fetchAllFromGoogleSheets(sheetsUrlInput);
    if (data) {
      setSheetsTestStatus('success');
      setSheetsMessage('🎉 Sucesso! A conexão com seu Google Sheets está ativa e sincronizando pedidos em tempo real!');
    } else {
      setSheetsTestStatus('error');
      setSheetsMessage('⚠️ Não foi possível ler a planilha. Verifique se você colou a URL correta do Web App do Apps Script e se autorizou o acesso.');
    }
  };

  const handleCopyAppsScriptCode = async () => {
    try {
      const response = await fetch('./src/services/GoogleAppsScript_Code.js');
      const text = await response.text();
      navigator.clipboard.writeText(text);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 3000);
    } catch {
      // Se não conseguir carregar o arquivo, copia instrução direta ou avisa para abrir o arquivo
      navigator.clipboard.writeText(`Verifique o arquivo src/services/GoogleAppsScript_Code.js no seu projeto e copie todo o conteúdo.`);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 3000);
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/90 backdrop-blur-md animate-fadeIn">
        <div className="relative w-full max-w-md bg-purple-900 border-2 border-amber-400/50 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center text-amber-300 text-3xl">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white font-['Outfit']">
              Painel do Lojista
            </h2>
            <p className="text-xs text-purple-200">
              Acesse para gerenciar produtos, preços, taxa de entrega, WhatsApp e visualizar pedidos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-600/20 border border-rose-500 text-rose-300 text-xs font-bold text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="text-xs text-purple-300 font-semibold block mb-1">Usuário</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="admin"
                className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="text-xs text-purple-300 font-semibold block mb-1">Senha</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="acai2026"
                className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 hover:scale-105 transition-transform"
            >
              Entrar no Painel
            </button>
          </form>

          <div className="pt-2 border-t border-purple-800 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 rounded-xl bg-purple-800/80 hover:bg-purple-800 text-amber-300 font-bold text-xs border border-purple-700 flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-4 h-4" />
              <span>Acesso Demo Rápido (Sem Digitar)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-purple-300 hover:text-white text-center underline block w-full py-1"
            >
              Voltar ao Catálogo da Loja
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-purple-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-6xl bg-purple-900 border-2 border-amber-400/50 rounded-3xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-purple-950 border-b border-purple-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-purple-950 font-black flex items-center justify-center text-lg shadow-md">
              👑
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
                <span>Painel de Controle Açaí Supremo</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Online & Ativo
                </span>
              </h2>
              <span className="text-xs text-purple-300">
                Lojista: Gestão de Cardápio, Adicionais, Frete, Horários, Google Sheets e Pedidos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Deseja restaurar todos os produtos e adicionais originais de fábrica do Açaí Supremo?')) {
                  onResetFactoryData();
                }
              }}
              className="p-2 rounded-xl bg-purple-900 hover:bg-amber-500/20 text-purple-300 hover:text-amber-300 border border-purple-700 text-xs font-semibold flex items-center gap-1"
              title="Restaurar Cardápio Padrão Gourmet"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Restaurar Padrão</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-purple-800 hover:bg-rose-500/20 text-purple-200 hover:text-rose-400 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <X className="w-5 h-5" />
              <span className="hidden sm:inline">Sair / Fechar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-purple-950/80 border-b border-purple-800/80 px-4 pt-2 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 shrink-0 border-t border-x ${
              activeTab === 'products'
                ? 'bg-purple-900 text-amber-300 border-amber-400/50 shadow-md'
                : 'bg-purple-950/60 text-purple-300 border-transparent hover:bg-purple-900/40'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produtos do Cardápio ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addons')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 shrink-0 border-t border-x ${
              activeTab === 'addons'
                ? 'bg-purple-900 text-amber-300 border-amber-400/50 shadow-md'
                : 'bg-purple-950/60 text-purple-300 border-transparent hover:bg-purple-900/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Adicionais e Preços ({addons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 shrink-0 border-t border-x ${
              activeTab === 'settings'
                ? 'bg-purple-900 text-amber-300 border-amber-400/50 shadow-md'
                : 'bg-purple-950/60 text-purple-300 border-transparent hover:bg-purple-900/40'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configurações & WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 shrink-0 border-t border-x ${
              activeTab === 'sheets'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-300 shadow-md'
                : 'bg-purple-950/60 text-emerald-300 border-transparent hover:bg-purple-900/40'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>⚡ Banco de Dados Google Sheets</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-t-2xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 shrink-0 border-t border-x ${
              activeTab === 'orders'
                ? 'bg-purple-900 text-amber-300 border-amber-400/50 shadow-md'
                : 'bg-purple-950/60 text-purple-300 border-transparent hover:bg-purple-900/40'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Pedidos Recebidos ({orders.length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* TAB 1: PRODUTOS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">Gestão Completa de Produtos</h3>
                  <p className="text-xs text-purple-300">Controle disponibilidade, altere preços na hora e defina os destaques em ouro.</p>
                </div>
                <button
                  onClick={handleOpenProductModalForNew}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-purple-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Cadastrar Novo Produto</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-purple-950/80 border border-purple-800/80 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className={`w-14 h-14 rounded-xl object-cover border border-amber-400/40 shrink-0 ${
                          !prod.isAvailable ? 'grayscale opacity-50' : ''
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-white truncate">{prod.name}</h4>
                          {prod.isBestSeller && (
                            <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-md font-bold shrink-0">
                              Top
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-black text-amber-400 block mt-0.5">
                          {formatCurrency(prod.price)}
                        </span>
                        <span className="text-[11px] text-purple-300/80 block truncate mt-0.5">
                          Categoria: {prod.categoryId} • {prod.isCustomizable ? 'Personalizável (4 tamanhos)' : 'Pronto'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleProductAvailability(prod.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${
                          prod.isAvailable
                            ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/50'
                            : 'bg-rose-600 text-white border-rose-500 hover:bg-rose-500'
                        }`}
                        title="Alternar entre Em Estoque e Esgotado"
                      >
                        {prod.isAvailable ? '✔ Em Estoque' : '🛑 Esgotado'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenProductModalForEdit(prod)}
                        className="p-2 rounded-xl bg-purple-900 hover:bg-amber-500/20 text-purple-200 hover:text-amber-300 border border-purple-700"
                        title="Editar Produto"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja excluir "${prod.name}" do cardápio?`)) {
                            onDeleteProduct(prod.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-purple-900 hover:bg-rose-500/20 text-purple-200 hover:text-rose-400 border border-purple-700"
                        title="Excluir Produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {(editingProduct !== null || prodName !== '') && (
                <div className="bg-purple-950 border-2 border-amber-400 rounded-2xl p-5 space-y-4 shadow-xl animate-fadeIn mt-6">
                  <div className="flex items-center justify-between border-b border-purple-800 pb-3">
                    <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{editingProduct ? `Editar: ${editingProduct.name}` : 'Cadastrar Novo Produto'}</span>
                    </h4>
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setProdName('');
                      }}
                      className="text-purple-300 hover:text-white text-xs"
                    >
                      Cancelar
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-purple-300 font-semibold block mb-1">Nome do Produto *</label>
                      <input
                        type="text"
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        placeholder="Ex: Copo Açaí com Leite Ninho"
                        required
                        className="w-full bg-purple-900 border border-purple-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-purple-300 font-semibold block mb-1">Preço Base (R$) *</label>
                      <input
                        type="number"
                        step="0.10"
                        value={prodPrice}
                        onChange={(e) => setProdPrice(Number(e.target.value))}
                        required
                        className="w-full bg-purple-900 border border-purple-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs text-purple-300 font-semibold block mb-1">Descrição do Produto</label>
                      <input
                        type="text"
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        placeholder="Ex: Camadas generosas de açaí cremoso com morangos frescos e Nutella..."
                        className="w-full bg-purple-900 border border-purple-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-purple-300 font-semibold block mb-1">Categoria do Produto</label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value)}
                        className="w-full bg-purple-900 border border-purple-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-purple-300 font-semibold block mb-1">URL da Foto do Produto</label>
                      <input
                        type="text"
                        value={prodImage}
                        onChange={(e) => setProdImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-purple-900 border border-purple-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-300">
                        <input
                          type="checkbox"
                          checked={prodCustomizable}
                          onChange={(e) => setProdCustomizable(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 bg-purple-900 border-purple-700"
                        />
                        <span>🎨 É Personalizável? (Permitir cliente escolher tamanho e adicionais)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-300">
                        <input
                          type="checkbox"
                          checked={prodBestSeller}
                          onChange={(e) => setProdBestSeller(e.target.checked)}
                          className="w-4 h-4 rounded text-rose-500 bg-purple-900 border-purple-700"
                        />
                        <span>🔥 Marcar como "Mais Vendido"</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-400">
                        <input
                          type="checkbox"
                          checked={prodGoldGourmet}
                          onChange={(e) => setProdGoldGourmet(e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 bg-purple-900 border-purple-700"
                        />
                        <span>👑 Borda Dourada Realeza Gourmet</span>
                      </label>
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setProdName('');
                        }}
                        className="px-4 py-2 rounded-xl bg-purple-800 text-purple-200 font-bold text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-purple-950 font-black text-xs shadow-md"
                      >
                        {editingProduct ? 'Salvar Modificações' : 'Cadastrar Produto'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADICIONAIS & PREÇOS */}
          {activeTab === 'addons' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white">Gestão de Adicionais & Preços de Coberturas</h3>
                <p className="text-xs text-purple-300">Altere o preço da Nutella, morango ou cadastre novos cremes instantaneamente.</p>
              </div>

              <form onSubmit={handleCreateAddon} className="bg-purple-950/80 border border-purple-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1">Nome do Adicional *</label>
                  <input
                    type="text"
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    placeholder="Ex: KitKat Branco"
                    required
                    className="w-full bg-purple-900 border border-purple-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.50"
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(Number(e.target.value))}
                    required
                    className="w-full bg-purple-900 border border-purple-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1">Categoria *</label>
                  <select
                    value={newAddonCat}
                    onChange={(e: any) => setNewAddonCat(e.target.value)}
                    className="w-full bg-purple-900 border border-purple-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
                  >
                    <option value="frutas">🍓 Frutas Frescas</option>
                    <option value="doces">🍫 Doces Gourmet</option>
                    <option value="crocantes">🥣 Crocantes</option>
                    <option value="coberturas">🍯 Coberturas</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-purple-950 font-black text-xs shadow-md flex items-center justify-center gap-1"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Cadastrar Adicional</span>
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {addons.map((add) => (
                  <div
                    key={add.id}
                    className="bg-purple-950/70 border border-purple-800 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-sm text-white block">{add.name}</span>
                      <span className="text-[10px] uppercase font-bold text-purple-300 block">
                        Categoria: {add.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-purple-900 px-2 py-1 rounded-xl border border-purple-700">
                        <span className="text-xs text-purple-300">R$</span>
                        <input
                          type="number"
                          step="0.50"
                          value={add.price}
                          onChange={(e) => onUpdateAddonPrice(add.id, Number(e.target.value))}
                          className="w-12 bg-transparent text-xs font-black text-amber-300 focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteAddon(add.id)}
                        className="p-1.5 rounded-xl bg-purple-900 hover:bg-rose-500/20 text-purple-300 hover:text-rose-400 transition-colors"
                        title="Excluir Adicional"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CONFIGURAÇÕES DA LOJA */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-4xl">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white">Configurações Gerais da Loja</h3>
                <p className="text-xs text-purple-300">Ajuste na hora o número do WhatsApp de recebimento de pedidos, taxa de entrega, chave PIX e horários.</p>
              </div>

              {settingsSavedMessage && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-2">
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Configurações salvas e aplicadas em tempo real na loja!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Número do WhatsApp da Loja (Recebimento de Pedidos) *</span>
                  </label>
                  <input
                    type="text"
                    value={tempSettings.whatsappNumber}
                    onChange={(e) => setTempSettings({ ...tempSettings, whatsappNumber: e.target.value })}
                    placeholder="Ex: 5511999998888"
                    required
                    className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                  />
                  <span className="text-[10px] text-purple-300">Inclua o código 55 + DDD + Telefone sem espaços (Ex: 5511998765432)</span>
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Taxa de Entrega Delivery (R$) *</span>
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={tempSettings.deliveryFee}
                    onChange={(e) => setTempSettings({ ...tempSettings, deliveryFee: Number(e.target.value) })}
                    required
                    className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Entrega Grátis acima de (R$) (Ou 0 para desativar)</span>
                  </label>
                  <input
                    type="number"
                    step="5.00"
                    value={tempSettings.freeDeliveryThreshold}
                    onChange={(e) => setTempSettings({ ...tempSettings, freeDeliveryThreshold: Number(e.target.value) })}
                    className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tempo Médio de Entrega *</span>
                  </label>
                  <input
                    type="text"
                    value={tempSettings.avgDeliveryTime}
                    onChange={(e) => setTempSettings({ ...tempSettings, avgDeliveryTime: e.target.value })}
                    placeholder="Ex: 30 - 45 min"
                    required
                    className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1">Horário de Funcionamento da Loja *</label>
                  <input
                    type="text"
                    value={tempSettings.openingHours}
                    onChange={(e) => setTempSettings({ ...tempSettings, openingHours: e.target.value })}
                    placeholder="Ex: Seg a Dom das 13h às 23h30"
                    required
                    className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1">Status Atual da Loja</label>
                  <select
                    value={tempSettings.isOpen ? 'open' : 'closed'}
                    onChange={(e) => setTempSettings({ ...tempSettings, isOpen: e.target.value === 'open' })}
                    className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-extrabold"
                  >
                    <option value="open">🟢 Loja Aberta - Recebendo Pedidos</option>
                    <option value="closed">🛑 Loja Fechada Temporariamente</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1">Chave PIX da Loja (Para exibição no Checkout)</label>
                  <input
                    type="text"
                    value={tempSettings.pixKey}
                    onChange={(e) => setTempSettings({ ...tempSettings, pixKey: e.target.value })}
                    className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-purple-300 font-semibold block mb-1">Nome ou Titular do PIX</label>
                  <input
                    type="text"
                    value={tempSettings.pixType}
                    onChange={(e) => setTempSettings({ ...tempSettings, pixType: e.target.value })}
                    className="w-full bg-purple-950 border border-purple-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-purple-800 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-purple-950 font-extrabold text-sm shadow-xl shadow-amber-500/25 hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Salvar Todas as Configurações da Loja</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: CONEXÃO GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <span>Conexão com Google Sheets (Banco de Dados em Tempo Real)</span>
                </h3>
                <p className="text-xs text-purple-300 mt-1">
                  Ao vincular sua planilha do Google Sheets, todos os pedidos efetuados pelo catálogo online serão gravados automaticamente em linhas na sua planilha, além do envio imediato para o WhatsApp!
                </p>
              </div>

              {/* Form to paste the Web App URL */}
              <form onSubmit={handleSaveSheetsUrl} className="bg-purple-950/80 border-2 border-emerald-500/40 rounded-2xl p-5 space-y-4">
                <div>
                  <label className="text-xs sm:text-sm text-emerald-300 font-bold block mb-1.5 flex items-center justify-between">
                    <span>URL do Web App do Google Apps Script (Sua Planilha)</span>
                    {sheetsTestStatus === 'success' && (
                      <span className="text-emerald-400 flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-4 h-4" /> Conectado com Sucesso
                      </span>
                    )}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={sheetsUrlInput}
                      onChange={(e) => setSheetsUrlInput(e.target.value)}
                      placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                      required
                      className="flex-1 bg-purple-900 border border-purple-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono placeholder:text-purple-400/60 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={sheetsTestStatus === 'testing'}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Database className="w-4 h-4" />
                      <span>{sheetsTestStatus === 'testing' ? 'Testando Conexão...' : 'Salvar & Conectar Planilha'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-purple-300 mt-1.5">
                    * Cole acima a URL gerada no passo 5 das instruções abaixo. O app sincronizará Pedidos, Produtos, Adicionais e Preços com as abas da sua planilha!
                  </p>
                </div>

                {sheetsMessage && (
                  <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    sheetsTestStatus === 'success'
                      ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-200'
                      : sheetsTestStatus === 'error'
                      ? 'bg-rose-600/20 border border-rose-500 text-rose-300'
                      : 'bg-purple-900 text-amber-300 border border-amber-400/40 animate-pulse'
                  }`}>
                    {sheetsTestStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
                    <span>{sheetsMessage}</span>
                  </div>
                )}
              </form>

              {/* Instructions Box & Copy Code Button */}
              <div className="bg-purple-950/90 border border-purple-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Passo a Passo Rápido: Como Criar sua API no Google Sheets</span>
                    </h4>
                    <span className="text-xs text-purple-300">Leva apenas 2 minutinhos (1 código para copiar e colar).</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAppsScriptCode}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-purple-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shrink-0"
                  >
                    {copiedScript ? <Check className="w-4 h-4 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedScript ? 'Código Copiado!' : 'Copiar Código Apps Script'}</span>
                  </button>
                </div>

                <ol className="list-decimal list-inside space-y-2.5 text-xs sm:text-sm text-purple-200 leading-relaxed">
                  <li>
                    Acesse o <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-amber-300 underline font-bold inline-flex items-center gap-0.5">Google Sheets <ExternalLink className="w-3 h-3" /></a> e crie uma planilha vazia chamada <strong>"Açaí Supremo - Banco de Dados"</strong>.
                  </li>
                  <li>
                    No menu superior da planilha, clique em: <strong>Extensões ➡️ Apps Script</strong>.
                  </li>
                  <li>
                    Apague todo o código de exemplo (<code>function myFunction() &#123; ... &#125;</code>) que aparecer no editor.
                  </li>
                  <li>
                    Clique no botão dourado <strong>"Copiar Código Apps Script"</strong> acima e <strong>cole</strong> todo o conteúdo lá no editor. Depois, clique no ícone de disquete (Salvar).
                  </li>
                  <li>
                    No canto superior direito, clique no botão azul <strong>Implantar (Deploy) ➡️ Nova Implantação (New deployment)</strong>:
                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-purple-300 bg-purple-900/60 p-2.5 rounded-xl border border-purple-800">
                      <li>Clique no ícone de engrenagem e selecione <strong>App da Web (Web App)</strong>.</li>
                      <li>Em "Executar como": escolha <strong>Eu (Me - seu e-mail)</strong>.</li>
                      <li>Em "Quem pode acessar": escolha <strong>Qualquer pessoa (Anyone)</strong> <span className="text-amber-300 font-semibold">(ESSENCIAL para o site poder gravar pedidos sem pedir login do Google para cada cliente)</span>.</li>
                    </ul>
                  </li>
                  <li>
                    Clique no botão azul <strong>Implantar</strong>, autorize o acesso à sua conta e copie a <strong>URL do Web App (https://script.google.com/.../exec)</strong> gerada.
                  </li>
                  <li>
                    Cole essa URL na caixa acima e clique em <strong>"Salvar & Conectar Planilha"</strong>! As abas <i>"Pedidos", "Produtos", "Adicionais", "Categorias" e "Configuracoes"</i> serão criadas e atualizadas sozinhas!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 5: PEDIDOS RECEBIDOS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">Histórico de Pedidos ({orders.length})</h3>
                  <p className="text-xs text-purple-300">Todos os pedidos gerados e enviados pelos clientes ficam armazenados aqui e na sua aba "Pedidos" do Google Sheets.</p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-purple-950/60 border border-purple-800 rounded-2xl space-y-2">
                  <span className="text-3xl block">📦</span>
                  <h4 className="font-bold text-white text-sm">Nenhum pedido recebido ainda nesta sessão.</h4>
                  <p className="text-xs text-purple-300">Assim que os clientes finalizarem seus açaís e clicarem em "Finalizar no WhatsApp", os pedidos aparecerão aqui e serão gravados na sua planilha!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="bg-purple-950/80 border border-purple-800 rounded-2xl p-4 sm:p-5 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-purple-800/80">
                        <div>
                          <span className="font-black text-sm text-amber-300 mr-2">{ord.id}</span>
                          <span className="text-xs text-purple-300">{ord.createdAt}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={ord.status}
                            onChange={(e: any) => onUpdateOrderStatus(ord.id, e.target.value)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                              ord.status === 'Concluído'
                                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                                : ord.status === 'Saiu para Entrega'
                                ? 'bg-amber-500/30 text-amber-300 border-amber-500'
                                : 'bg-purple-900 text-purple-200 border-purple-700'
                            }`}
                          >
                            <option value="Novo">🟡 Novo</option>
                            <option value="Pendente">🟡 Pendente</option>
                            <option value="Em Preparo">🥣 Em Preparo</option>
                            <option value="Saiu para Entrega">🛵 Saiu para Entrega</option>
                            <option value="Concluído">🟢 Concluído</option>
                          </select>

                          <button
                            onClick={() => {
                              const cleanP = ord.customer.phone.replace(/\D/g, '');
                              window.open(`https://wa.me/55${cleanP}?text=Olá ${ord.customer.name}, aqui é da Açaí Supremo Ouro! Falo referente ao seu pedido *${ord.id}*.`, '_blank');
                            }}
                            className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1 transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>Falar com Cliente</span>
                          </button>
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-purple-200 bg-purple-900/40 p-3 rounded-xl border border-purple-800/60">
                        <div>
                          <strong className="text-white block">Cliente: {ord.customer.name}</strong>
                          <span>Telefone: {ord.customer.phone}</span>
                        </div>
                        <div>
                          <strong className="text-white block">
                            {ord.customer.deliveryMethod === 'delivery' ? '🛵 Delivery em:' : '🏪 Retirada na Loja'}
                          </strong>
                          {ord.customer.deliveryMethod === 'delivery' && (
                            <span>
                              Rua {ord.customer.street}, {ord.customer.number} - {ord.customer.neighborhood}
                              {ord.customer.complement ? ` (${ord.customer.complement})` : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-1 text-xs text-purple-100">
                        <strong className="text-amber-300 block mb-1">Itens do Pedido:</strong>
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-purple-200 pl-2 border-l-2 border-amber-400/60">
                            <div>
                              <span className="font-bold text-white">{item.quantity}x {item.productName}</span>
                              {item.selectedSize && <span className="text-amber-300"> ({item.selectedSize.name})</span>}
                              {item.selectedAddons && item.selectedAddons.length > 0 && (
                                <div className="text-[11px] text-purple-300 mt-0.5 space-x-1">
                                  {item.selectedAddons.map((sel, sidx) => (
                                    <span key={sidx} className="inline-block bg-purple-900 px-1.5 py-0.2 rounded">
                                      + {sel.addon.name} ({sel.quantity}x)
                                    </span>
                                  ))}
                                </div>
                              )}
                              {item.notes && <p className="text-[11px] italic text-amber-200/80">Obs: "{item.notes}"</p>}
                            </div>
                            <span className="font-bold text-amber-300 shrink-0">{formatCurrency(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="pt-2 border-t border-purple-800/80 flex items-center justify-between text-xs sm:text-sm font-black">
                        <span className="text-purple-300">Pagamento: {ord.customer.paymentMethod.toUpperCase()} ({ord.customer.changeFor})</span>
                        <span className="text-amber-400 font-['Outfit'] text-base">Total: {formatCurrency(ord.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
