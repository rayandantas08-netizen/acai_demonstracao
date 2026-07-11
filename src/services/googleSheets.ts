// Google Sheets Database API Integration Service for Açaí Supremo Ouro
// Permite usar o Google Sheets como banco de dados em tempo real via Google Apps Script Webhook ou API v4.

import { Product, AddonItem, Category, StoreSettings, OrderRecord, CustomerReview } from '../types';

export interface GoogleSheetsDatabase {
  products?: Product[];
  addons?: AddonItem[];
  categories?: Category[];
  storeSettings?: StoreSettings;
  reviews?: CustomerReview[];
  orders?: OrderRecord[];
}

/**
 * Pega a URL da API do Google Sheets configurada pelo usuário (via variável de ambiente ou localStorage)
 */
export function getGoogleSheetsApiUrl(): string {
  // 1. Tenta pegar do LocalStorage alterado via Painel Admin
  const savedUrl = localStorage.getItem('acai_google_sheets_url');
  if (savedUrl && savedUrl.trim() !== '') {
    return savedUrl.trim();
  }
  // 2. Tenta pegar da variável de ambiente (VITE_GOOGLE_SHEETS_API_URL) no arquivo .env
  if (import.meta.env.VITE_GOOGLE_SHEETS_API_URL) {
    return import.meta.env.VITE_GOOGLE_SHEETS_API_URL.trim();
  }
  return '';
}

/**
 * Salva a URL da API do Google Sheets no localStorage
 */
export function setGoogleSheetsApiUrl(url: string): void {
  localStorage.setItem('acai_google_sheets_url', url.trim());
}

/**
 * Testa a conexão e carrega todos os dados do Google Sheets (Produtos, Adicionais, Categorias, Configurações e Pedidos)
 */
export async function fetchAllFromGoogleSheets(apiUrl: string = getGoogleSheetsApiUrl()): Promise<GoogleSheetsDatabase | null> {
  if (!apiUrl) {
    console.warn('Google Sheets API URL não configurada. Usando dados locais do localStorage/Fábrica.');
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}?action=getAllData`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
    }

    const data: GoogleSheetsDatabase = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na sincronização de leitura com Google Sheets:', error);
    return null;
  }
}

/**
 * Envia e registra um novo PEDIDO automaticamente na aba "Pedidos" do Google Sheets
 */
export async function sendOrderToGoogleSheets(
  order: OrderRecord,
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<{ success: boolean; message?: string }> {
  if (!apiUrl) {
    console.warn('Pedido salvo localmente (Google Sheets API URL não informada).');
    return { success: false, message: 'API não configurada' };
  }

  try {
    // Usamos text/plain com JSON.stringify para evitar bloqueios de pre-flight CORS do Google Apps Script
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'saveOrder',
        order: {
          id: order.id,
          createdAt: order.createdAt,
          customerName: order.customer.name,
          customerPhone: order.customer.phone,
          deliveryMethod: order.customer.deliveryMethod,
          address: order.customer.deliveryMethod === 'delivery' 
            ? `${order.customer.street}, ${order.customer.number} - ${order.customer.neighborhood} (${order.customer.complement || ''})`
            : 'Retirada no Balcão',
          itemsSummary: order.items.map(i => `${i.quantity}x ${i.productName}${i.selectedSize ? ` (${i.selectedSize.name})` : ''}`).join(' | '),
          itemsJson: JSON.stringify(order.items),
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          discount: order.discount,
          total: order.total,
          paymentMethod: order.customer.paymentMethod,
          changeFor: order.customer.changeFor,
          status: order.status
        }
      }),
    });

    const result = await response.json().catch(() => ({ success: true }));
    return { success: true, message: result.message || 'Pedido salvo no Google Sheets!' };
  } catch (error) {
    console.error('Erro ao enviar pedido para o Google Sheets:', error);
    return { success: false, message: 'Erro na conexão com Google Sheets' };
  }
}

/**
 * Sincroniza (atualiza) os Produtos editados no painel Lojista para a aba "Produtos" no Google Sheets
 */
export async function syncProductsToGoogleSheets(
  products: Product[],
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<boolean> {
  if (!apiUrl) return false;

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'syncProducts',
        products
      })
    });
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar produtos com Google Sheets:', error);
    return false;
  }
}

/**
 * Sincroniza (atualiza) os Adicionais editados para a aba "Adicionais" no Google Sheets
 */
export async function syncAddonsToGoogleSheets(
  addons: AddonItem[],
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<boolean> {
  if (!apiUrl) return false;

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'syncAddons',
        addons
      })
    });
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar adicionais com Google Sheets:', error);
    return false;
  }
}

/**
 * Sincroniza (atualiza) as Configurações da Loja para a aba "Configuracoes" no Google Sheets
 */
export async function syncSettingsToGoogleSheets(
  storeSettings: StoreSettings,
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<boolean> {
  if (!apiUrl) return false;

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'syncSettings',
        storeSettings
      })
    });
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar configurações com Google Sheets:', error);
    return false;
  }
}

/**
 * Sincroniza a alteração de status do Pedido (Ex: de "Novo" para "Saiu para Entrega")
 */
export async function syncOrderStatusToGoogleSheets(
  orderId: string,
  newStatus: string,
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<boolean> {
  if (!apiUrl) return false;

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'updateOrderStatus',
        orderId,
        status: newStatus
      })
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar status do pedido no Google Sheets:', error);
    return false;
  }
}
