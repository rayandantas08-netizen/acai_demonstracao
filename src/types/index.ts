// Data structure and types for Açaí Supremo Ouro & Púrpura

export type CategoryId = 
  | 'acai-tradicional'
  | 'copos-montados'
  | 'barcas'
  | 'combos'
  | 'milk-shakes'
  | 'cremes'
  | 'bebidas'
  | 'adicionais';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
}

export interface ProductSize {
  id: string;
  name: string; // e.g. "300ml", "500ml", "700ml", "1 Litro"
  price: number;
}

export interface AddonItem {
  id: string;
  name: string;
  price: number;
  category: 'frutas' | 'doces' | 'crocantes' | 'coberturas';
  isPopular?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: CategoryId;
  isCustomizable: boolean; // True if user can choose sizes & add-ons
  sizes?: ProductSize[];
  isAvailable: boolean;
  isBestSeller?: boolean;
  isGoldGourmet?: boolean;
  badge?: string;
}

export interface CartAddonSelection {
  addon: AddonItem;
  quantity: number;
}

export interface CartItem {
  id: string; // unique instance id inside cart
  productId: string;
  productName: string;
  productImage: string;
  selectedSize?: ProductSize;
  selectedAddons: CartAddonSelection[];
  notes?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type DeliveryMethod = 'delivery' | 'retirada';
export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';

export interface CustomerData {
  name: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  // Delivery address fields
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  reference: string;
  // Payment info
  paymentMethod: PaymentMethod;
  changeFor: string; // "Para R$ 100,00" or "Não precisa de troco"
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  whatsappNumber: string; // e.g. "5511999998888"
  deliveryFee: number;
  freeDeliveryThreshold: number;
  openingHours: string;
  avgDeliveryTime: string;
  isOpen: boolean;
  pixKey: string;
  pixType: string;
  minimumOrder: number;
  address: string;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  customer: CustomerData;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: 'Pendente' | 'Confirmado' | 'Em Preparo' | 'Saiu para Entrega' | 'Concluído';
}

export interface CustomerReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  verified: boolean;
}

// Default Categories
export const INITIAL_CATEGORIES: Category[] = [
  { id: 'copos-montados', name: 'Copos Montados', icon: '🥤', description: 'Monte seu açaí ideal com camadas e adicionais ilimitados!' },
  { id: 'barcas', name: 'Barcas Gourmet', icon: '🚤', description: 'O banquete imperial de açaí para compartilhar com a família ou amigos.' },
  { id: 'acai-tradicional', name: 'Açaí Tradicional', icon: '👑', description: 'O puro sabor amazônico, batido com precisão e cremosidade incomparável.' },
  { id: 'combos', name: 'Combos & Promos', icon: '⚡', description: 'Ofertas especiais para casais e grupos com desconto exclusivo.' },
  { id: 'milk-shakes', name: 'Milk Shakes & Cremes', icon: '🍨', description: 'Shakes trufados, Creme de Ninho, Cupuaçu e Pitaya premium.' },
  { id: 'cremes', name: 'Cremes Especiais', icon: '🥣', description: 'Creme de Leite Ninho, Creme de Avelã e Creme de Cupuaçu.' },
  { id: 'bebidas', name: 'Bebidas Geladas', icon: '🍹', description: 'Água de coco geladíssima, sucos naturais e refrigerantes.' },
  { id: 'adicionais', name: 'Potes de Complementos', icon: '🍒', description: 'Adicionais avulsos para você turbinar na sua casa.' },
];

// Default Addons organized by exact user requested groups
export const INITIAL_ADDONS: AddonItem[] = [
  // Frutas
  { id: 'f-banana', name: 'Banana Fatiada', price: 0.00, category: 'frutas', isPopular: true },
  { id: 'f-morango', name: 'Morango Fresco', price: 3.50, category: 'frutas', isPopular: true },
  { id: 'f-kiwi', name: 'Kiwi em Rodelas', price: 3.50, category: 'frutas' },
  { id: 'f-manga', name: 'Manga Doce Cubos', price: 2.50, category: 'frutas' },
  { id: 'f-uva', name: 'Uva Sem Semente', price: 3.50, category: 'frutas', isPopular: true },

  // Doces
  { id: 'd-leitecond', name: 'Leite Condensado', price: 2.50, category: 'doces', isPopular: true },
  { id: 'd-nutella', name: 'Nutella Original', price: 5.00, category: 'doces', isPopular: true },
  { id: 'd-doceleite', name: 'Doce de Leite Cremoso', price: 3.50, category: 'doces' },
  { id: 'd-pacoca', name: 'Paçoca Triturada', price: 2.00, category: 'doces', isPopular: true },
  { id: 'd-ourobranco', name: 'Ouro Branco em Pedaços', price: 4.50, category: 'doces', isPopular: true },
  { id: 'd-kitkat', name: 'KitKat ao Leite', price: 4.50, category: 'doces' },
  { id: 'd-mms', name: 'M&Ms Coloridos', price: 4.00, category: 'doces' },

  // Crocantes
  { id: 'c-granola', name: 'Granola Artesanal Crocante', price: 2.00, category: 'crocantes', isPopular: true },
  { id: 'c-castanha', name: 'Castanha do Pará Picada', price: 3.50, category: 'crocantes' },
  { id: 'c-amendoim', name: 'Amendoim Granulado', price: 2.00, category: 'crocantes' },
  { id: 'c-sucrilhos', name: 'Sucrilhos Kelloggs', price: 2.50, category: 'crocantes' },
  { id: 'c-ninho', name: 'Leite em Pó Ninho', price: 3.00, category: 'crocantes', isPopular: true },

  // Coberturas
  { id: 'cob-choc', name: 'Calda de Chocolate Gourmet', price: 2.00, category: 'coberturas' },
  { id: 'cob-morango', name: 'Calda de Morango Vermelha', price: 2.00, category: 'coberturas' },
  { id: 'cob-caramelo', name: 'Calda de Caramelo Salgado', price: 2.00, category: 'coberturas' },
  { id: 'cob-mel', name: 'Mel Orgânico Puro', price: 3.00, category: 'coberturas' },
];

// Default Products
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'copo-imperador-ouro',
    name: 'Copo Açaí Supremo (Personalizado)',
    description: 'Nosso copo mais amado! Escolha o tamanho e adicione todas as frutas, doces, crocantes e coberturas no seu estilo sem limites.',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80',
    categoryId: 'copos-montados',
    isCustomizable: true,
    isAvailable: true,
    isBestSeller: true,
    isGoldGourmet: true,
    badge: '👑 O MAIS PEDIDO',
    sizes: [
      { id: 's-300', name: '300ml', price: 16.00 },
      { id: 's-500', name: '500ml (Recomendado)', price: 22.00 },
      { id: 's-700', name: '700ml (Super Mega)', price: 29.00 },
      { id: 's-1000', name: '1 Litro (Família)', price: 39.00 },
    ],
  },
  {
    id: 'barca-realeza-500',
    name: 'Barca Imperial Ouro Gourmet (500ml)',
    description: 'Uma barca recheada com açaí cremoso de alta pureza + divisórias com Morango fresco, Kiwi, Nutella original, Leite Ninho e Granola artesanal.',
    price: 48.90,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
    categoryId: 'barcas',
    isCustomizable: true,
    isAvailable: true,
    isBestSeller: true,
    isGoldGourmet: true,
    badge: '⚡ BARCA DELUXE',
    sizes: [
      { id: 'b-500', name: 'Barca Média 500ml', price: 48.90 },
      { id: 'b-1200', name: 'Barca Família 1.2 Litro', price: 89.90 },
    ],
  },
  {
    id: 'copo-nutella-ninho',
    name: 'Copo Casadinho Ouro (Nutella + Ninho)',
    description: 'Camadas generosas de Açaí Púrpura, Leite Ninho integral em pó, Nutella pura transbordando nas bordas e morango em cubos.',
    price: 28.50,
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    categoryId: 'copos-montados',
    isCustomizable: true,
    isAvailable: true,
    isBestSeller: true,
    badge: '🔥 CHEF RECOMMEND',
    sizes: [
      { id: 's-300', name: '300ml', price: 22.50 },
      { id: 's-500', name: '500ml', price: 28.50 },
      { id: 's-700', name: '700ml', price: 36.50 },
      { id: 's-1000', name: '1 Litro', price: 47.00 },
    ],
  },
  {
    id: 'acai-puro-amazonico',
    name: 'Açaí Tradicional Raiz Amazônico',
    description: 'Para quem ama o sabor verdadeiro! Açaí puro batido na hora com xarope de guaraná natural ou adoçado com mel. Cremosidade única.',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
    categoryId: 'acai-tradicional',
    isCustomizable: true,
    isAvailable: true,
    sizes: [
      { id: 't-300', name: 'Pote 300ml', price: 18.00 },
      { id: 't-500', name: 'Pote 500ml', price: 24.00 },
      { id: 't-700', name: 'Pote 700ml', price: 32.00 },
      { id: 't-1000', name: 'Pote 1 Litro', price: 42.00 },
    ],
  },
  {
    id: 'combo-casal-ouro',
    name: 'Combo Casal Púrpura & Ouro (2x 500ml)',
    description: 'Dois copos de 500ml completos com Banana, Morango, Leite Condensado, Leite Ninho e 1 potinho extra de Nutella cortesia!',
    price: 54.90,
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=800&q=80',
    categoryId: 'combos',
    isCustomizable: false,
    isAvailable: true,
    isBestSeller: true,
    badge: '💥 ECONOMIZE R$ 12,00',
  },
  {
    id: 'milkshake-acai-pacoca',
    name: 'Milk Shake Açaí Trufado com Paçoca',
    description: 'Milk Shake cremoso de Açaí batido com sorvete de baunilha, paçoca de amendoim artesanal e calda de caramelo dourado na taça.',
    price: 21.90,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
    categoryId: 'milk-shakes',
    isCustomizable: false,
    isAvailable: true,
  },
  {
    id: 'creme-cupuacu-maracuja',
    name: 'Creme de Cupuaçu Paraense Gourmet',
    description: 'O legítimo creme de cupuaçu do Pará, com toque refrescante e acidez perfeita. Opção ideal para misturar meio a meio com seu açaí.',
    price: 23.00,
    image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=800&q=80',
    categoryId: 'cremes',
    isCustomizable: true,
    isAvailable: true,
    sizes: [
      { id: 'c-300', name: '300ml', price: 17.00 },
      { id: 'c-500', name: '500ml', price: 23.00 },
      { id: 'c-700', name: '700ml', price: 31.00 },
    ],
  },
  {
    id: 'agua-coco-natural',
    name: 'Água de Coco Natural Gelada (500ml)',
    description: 'Água de coco verde 100% natural, sem adição de açúcares, servida bem gelada para acompanhar seu açaí.',
    price: 8.00,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    categoryId: 'bebidas',
    isCustomizable: false,
    isAvailable: true,
  },
  {
    id: 'pote-nutella-100g',
    name: 'Pote Avulso Nutella Original (100g)',
    description: 'Potinho selado de Nutella pura 100g para você adicionar o quanto quiser no seu açaí ou sobremesas em casa.',
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?auto=format&fit=crop&w=800&q=80',
    categoryId: 'adicionais',
    isCustomizable: false,
    isAvailable: true,
  },
];

export const INITIAL_STORE_SETTINGS: StoreSettings = {
  storeName: 'AÇAÍ SUPREMO OURO',
  slogan: 'O Sabor Púrpura & Dourado da Realeza Amazônica',
  whatsappNumber: '5511998765432', // Can be customized right in Admin
  deliveryFee: 5.00,
  freeDeliveryThreshold: 60.00,
  openingHours: 'Seg a Dom das 13h00 às 23h30',
  avgDeliveryTime: '30 - 45 min',
  isOpen: true,
  pixKey: 'acai.supremo.ouro@pix.com.br',
  pixType: 'E-mail ou CNPJ 44.333.222/0001-99',
  minimumOrder: 15.00,
  address: 'Av. Paulista, 1800 - Bela Vista, São Paulo - SP',
};

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    name: 'Beatriz Almeida',
    rating: 5,
    comment: 'Melhor açaí da cidade sem dúvidas! A barca 500ml veio explodindo de Nutella e as frutas são super fresquinhas. Entrega em 25 minutos!',
    date: 'Hoje às 18:40',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    verified: true,
  },
  {
    id: 'rev-2',
    name: 'Carlos Eduardo Oliveira',
    rating: 5,
    comment: 'O Copo Supremo com Leite Ninho e Ouro Branco é sensacional. O atendimento pelo WhatsApp pós-pedido foi super educado e rápido.',
    date: 'Ontem',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    verified: true,
  },
  {
    id: 'rev-3',
    name: 'Juliana Mendes & Gabriel',
    rating: 5,
    comment: 'Pedimos o Combo Casal e valeu cada centavo. Açaí cremoso, nada daquela barra de gelo que outras lojas vendem. Somos clientes fiéis!',
    date: '2 dias atrás',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    verified: true,
  },
  {
    id: 'rev-4',
    name: 'Lucas Ferreira',
    rating: 5,
    comment: 'Adoro montar meu açaí de 700ml com kiwi, manga, paçoca e mel! Parabéns pelo catálogo online, muito fácil de usar no celular.',
    date: 'Semana passada',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    verified: true,
  },
];
