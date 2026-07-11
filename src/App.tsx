import { useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  Category, 
  StoreSettings, 
  CartItem, 
  OrderRecord, 
  CustomerReview, 
  AddonItem, 
  DeliveryMethod,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_STORE_SETTINGS,
  INITIAL_REVIEWS,
  INITIAL_ADDONS
} from './types';

import {
  getGoogleSheetsApiUrl,
  fetchAllFromGoogleSheets,
  sendOrderToGoogleSheets,
  syncProductsToGoogleSheets,
  syncAddonsToGoogleSheets,
  syncSettingsToGoogleSheets,
  syncOrderStatusToGoogleSheets
} from './services/googleSheets';

import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { CustomizerModal } from './components/CustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminPanel } from './components/AdminPanel';
import { ReviewsCarousel } from './components/ReviewsCarousel';
import { Footer } from './components/Footer';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('acai_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('acai_theme', theme);
  }, [theme]);

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('acai_store_settings');
    return saved ? JSON.parse(saved) : INITIAL_STORE_SETTINGS;
  });

  const handleUpdateStoreSettings = (newSet: StoreSettings) => {
    setStoreSettings(newSet);
    localStorage.setItem('acai_store_settings', JSON.stringify(newSet));
    syncSettingsToGoogleSheets(newSet);
  };

  // Categories State
  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  // Products State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('acai_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const saveProductsToStorage = (prods: Product[]) => {
    setProducts(prods);
    localStorage.setItem('acai_products', JSON.stringify(prods));
    syncProductsToGoogleSheets(prods);
  };

  // Addons State
  const [addons, setAddons] = useState<AddonItem[]>(() => {
    const saved = localStorage.getItem('acai_addons');
    return saved ? JSON.parse(saved) : INITIAL_ADDONS;
  });

  const saveAddonsToStorage = (addList: AddonItem[]) => {
    setAddons(addList);
    localStorage.setItem('acai_addons', JSON.stringify(addList));
    syncAddonsToGoogleSheets(addList);
  };

  // Reviews State
  const [reviews] = useState<CustomerReview[]>(INITIAL_REVIEWS);

  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('acai_favorites');
    return saved ? JSON.parse(saved) : ['copo-imperador-ouro', 'barca-realeza-500'];
  });

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      localStorage.setItem('acai_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('acai_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('acai_cart', JSON.stringify(newCart));
  };

  const handleAddToCart = (newItem: CartItem) => {
    const existingIndex = cart.findIndex((item) => item.id === newItem.id);
    if (existingIndex >= 0) {
      const copy = [...cart];
      copy[existingIndex] = newItem;
      saveCartToStorage(copy);
    } else {
      saveCartToStorage([...cart, newItem]);
    }
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    const updated = cart.map((item) => (item.id === itemId ? { ...item, quantity: newQty, totalPrice: item.unitPrice * newQty } : item));
    saveCartToStorage(updated);
  };

  const handleRemoveItem = (itemId: string) => {
    const updated = cart.filter((item) => item.id !== itemId);
    saveCartToStorage(updated);
  };

  // Orders History State
  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    const saved = localStorage.getItem('acai_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Carregamento automático de dados vivos do Google Sheets ao abrir o app
  useEffect(() => {
    const loadFromGoogleSheetsIfConnected = async () => {
      const apiUrl = getGoogleSheetsApiUrl();
      if (apiUrl) {
        const remoteData = await fetchAllFromGoogleSheets(apiUrl);
        if (remoteData) {
          if (remoteData.products && remoteData.products.length > 0) {
            setProducts(remoteData.products);
            localStorage.setItem('acai_products', JSON.stringify(remoteData.products));
          }
          if (remoteData.addons && remoteData.addons.length > 0) {
            setAddons(remoteData.addons);
            localStorage.setItem('acai_addons', JSON.stringify(remoteData.addons));
          }
          if (remoteData.storeSettings && remoteData.storeSettings.storeName) {
            setStoreSettings(prev => ({ ...prev, ...remoteData.storeSettings }));
            localStorage.setItem('acai_store_settings', JSON.stringify({ ...storeSettings, ...remoteData.storeSettings }));
          }
          if (remoteData.orders && remoteData.orders.length > 0) {
            setOrders(remoteData.orders);
            localStorage.setItem('acai_orders', JSON.stringify(remoteData.orders));
          }
        }
      }
    };
    loadFromGoogleSheetsIfConnected();
  }, []);

  const handleOrderCompleted = (newOrder: OrderRecord) => {
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem('acai_orders', JSON.stringify(updatedOrders));
    saveCartToStorage([]); // Limpa carrinho
    sendOrderToGoogleSheets(newOrder);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderRecord['status']) => {
    const updated = orders.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
    setOrders(updated);
    localStorage.setItem('acai_orders', JSON.stringify(updated));
    syncOrderStatusToGoogleSheets(orderId, status);
  };

  // Filter & Navigation State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterAvailableOnly, setFilterAvailableOnly] = useState<boolean>(false);
  const [filterBestSellersOnly, setFilterBestSellersOnly] = useState<boolean>(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Modals Visibility
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [selectedProductForCustomizer, setSelectedProductForCustomizer] = useState<Product | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutDeliveryMethod, setCheckoutDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);
  const [checkoutCoupon, setCheckoutCoupon] = useState<string>('');

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState<boolean>(false);

  // Filtered Products Memo
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (selectedCategory !== 'all' && !showFavoritesOnly && prod.categoryId !== selectedCategory) {
        return false;
      }
      if (showFavoritesOnly && !favorites.includes(prod.id)) {
        return false;
      }
      if (filterAvailableOnly && !prod.isAvailable) {
        return false;
      }
      if (filterBestSellersOnly && !prod.isBestSeller) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(query);
        const matchesDesc = prod.description.toLowerCase().includes(query);
        const matchesCat = prod.categoryId.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery, filterAvailableOnly, filterBestSellersOnly, showFavoritesOnly, favorites]);

  const handleSelectProduct = (prod: Product) => {
    setSelectedProductForCustomizer(prod);
    setEditingCartItem(null);
    setIsCustomizerOpen(true);
  };

  const handleEditCartItem = (item: CartItem) => {
    const found = products.find((p) => p.id === item.productId);
    if (found) {
      setSelectedProductForCustomizer(found);
      setEditingCartItem(item);
      setIsCustomizerOpen(true);
    }
  };

  const handleScrollToCategory = (catId: string) => {
    setSelectedCategory(catId);
    setShowFavoritesOnly(false);
    const element = document.getElementById('catalogo-main');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAddProduct = (prod: Product) => {
    saveProductsToStorage([prod, ...products]);
  };

  const handleUpdateProduct = (prod: Product) => {
    saveProductsToStorage(products.map((p) => (p.id === prod.id ? prod : p)));
  };

  const handleDeleteProduct = (prodId: string) => {
    saveProductsToStorage(products.filter((p) => p.id !== prodId));
  };

  const handleToggleProductAvailability = (prodId: string) => {
    saveProductsToStorage(products.map((p) => (p.id === prodId ? { ...p, isAvailable: !p.isAvailable } : p)));
  };

  const handleUpdateAddonPrice = (addonId: string, newPrice: number) => {
    saveAddonsToStorage(addons.map((a) => (a.id === addonId ? { ...a, price: newPrice } : a)));
  };

  const handleAddAddon = (addon: AddonItem) => {
    saveAddonsToStorage([...addons, addon]);
  };

  const handleDeleteAddon = (addonId: string) => {
    saveAddonsToStorage(addons.filter((a) => a.id !== addonId));
  };

  const handleResetFactoryData = () => {
    saveProductsToStorage(INITIAL_PRODUCTS);
    saveAddonsToStorage(INITIAL_ADDONS);
    handleUpdateStoreSettings(INITIAL_STORE_SETTINGS);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-purple-900 text-white'
    }`}>
      {/* Header */}
      <Header
        storeSettings={storeSettings}
        cart={cart}
        favoritesCount={favorites.length}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onShowFavorites={() => {
          setShowFavoritesOnly((prev) => !prev);
          if (!showFavoritesOnly) {
            const el = document.getElementById('catalogo-main');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Hero Section */}
      <HeroBanner
        storeSettings={storeSettings}
        onScrollToCategory={handleScrollToCategory}
        onOpenReviews={() => setIsReviewsOpen(true)}
      />

      {/* Sticky Categories & Search Nav */}
      <div id="catalogo-main">
        <CategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            setShowFavoritesOnly(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterAvailableOnly={filterAvailableOnly}
          onToggleAvailableOnly={() => setFilterAvailableOnly((prev) => !prev)}
          filterBestSellersOnly={filterBestSellersOnly}
          onToggleBestSellersOnly={() => setFilterBestSellersOnly((prev) => !prev)}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavoritesOnly={() => setShowFavoritesOnly((prev) => !prev)}
          favoritesCount={favorites.length}
        />
      </div>

      {/* Main Catalog Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-800/80 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 font-['Outfit'] flex items-center gap-2.5">
              <span>
                {showFavoritesOnly
                  ? '❤️ Meus Açaís Favoritos'
                  : selectedCategory === 'all'
                  ? '🌟 Cardápio Gourmet Completo'
                  : categories.find((c) => c.id === selectedCategory)?.name || 'Produtos'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
              {showFavoritesOnly
                ? 'Aqui estão os itens de açaí e barcas que você marcou com o coração.'
                : selectedCategory === 'all'
                ? 'Clique em "Personalizar" para escolher o tamanho (300ml, 500ml, 700ml ou 1L) e adicionar frutas, doces, crocantes e coberturas ilimitadas!'
                : categories.find((c) => c.id === selectedCategory)?.description}
            </p>
          </div>

          <div className="text-xs font-bold text-amber-300/90 bg-purple-900/80 px-3.5 py-1.5 rounded-xl border border-purple-700 self-start sm:self-auto">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos disponíveis'}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-purple-950/70 border-2 border-purple-800/80 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 my-8">
            <div className="w-20 h-20 rounded-full bg-purple-900 border-2 border-purple-700 mx-auto flex items-center justify-center text-3xl">
              🔍
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white">Nenhum produto encontrado</h3>
              <p className="text-xs sm:text-sm text-purple-300 mt-1">
                Não encontramos nenhum item com os filtros selecionados ou termo de busca atual.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setShowFavoritesOnly(false);
                setFilterAvailableOnly(false);
                setFilterBestSellersOnly(false);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 text-purple-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform"
            >
              Ver Cardápio Completo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                isFavorite={favorites.includes(prod.id)}
                onToggleFavorite={handleToggleFavorite}
                onSelectProduct={handleSelectProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        storeSettings={storeSettings}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenReviews={() => setIsReviewsOpen(true)}
      />

      {/* Modals & Drawers */}
      <CustomizerModal
        product={selectedProductForCustomizer}
        allAddons={addons}
        isOpen={isCustomizerOpen}
        onClose={() => {
          setIsCustomizerOpen(false);
          setSelectedProductForCustomizer(null);
          setEditingCartItem(null);
        }}
        onAddToCart={handleAddToCart}
        initialCartItem={editingCartItem}
      />

      <CartDrawer
        cart={cart}
        storeSettings={storeSettings}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onEditItem={handleEditCartItem}
        onProceedToCheckout={(method, disc, coupon) => {
          setCheckoutDeliveryMethod(method);
          setCheckoutDiscount(disc);
          setCheckoutCoupon(coupon);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        cart={cart}
        storeSettings={storeSettings}
        deliveryMethod={checkoutDeliveryMethod}
        discountAmount={checkoutDiscount}
        couponCode={checkoutCoupon}
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />

      <ReviewsCarousel
        reviews={reviews}
        isOpen={isReviewsOpen}
        onClose={() => setIsReviewsOpen(false)}
      />

      <AdminPanel
        products={products}
        categories={categories}
        addons={addons}
        storeSettings={storeSettings}
        orders={orders}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onUpdateStoreSettings={handleUpdateStoreSettings}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleProductAvailability={handleToggleProductAvailability}
        onUpdateAddonPrice={handleUpdateAddonPrice}
        onAddAddon={handleAddAddon}
        onDeleteAddon={handleDeleteAddon}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onResetFactoryData={handleResetFactoryData}
      />
    </div>
  );
}
