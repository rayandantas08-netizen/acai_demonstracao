// Google Sheets Database API Integration Service for Açaí Supremo Ouro
// Versão otimizada para PC e Celular

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
 * Testa a conexão e carrega todos os dados do Google Sheets
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
 * Envia e registra um novo PEDIDO - VERSÃO CORRIGIDA PARA CELULAR
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
    // PREPARA OS DADOS DO PEDIDO
    const orderData = {
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
    };

    // ===== SOLUÇÃO PARA CELULAR =====
    // Tenta com application/json primeiro (funciona em ambos)
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({ success: true }));
        return { success: true, message: result.message || 'Pedido salvo no Google Sheets!' };
      }
    } catch (jsonError) {
      console.warn('Falha com application/json, tentando text/plain...', jsonError);
    }

    // ===== FALLBACK: text/plain (para compatibilidade) =====
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const result = await response.json().catch(() => ({ success: true }));
    return { success: true, message: result.message || 'Pedido salvo no Google Sheets!' };

  } catch (error) {
    console.error('Erro ao enviar pedido para o Google Sheets:', error);
    
    // ===== SALVAR LOCALMENTE COMO FALLBACK =====
    try {
      const orders = JSON.parse(localStorage.getItem('acai_orders_backup') || '[]');
      orders.push({ 
        ...order, 
        synced: false, 
        timestamp: new Date().toISOString(),
        syncAttempts: (order as any).syncAttempts || 0 + 1
      });
      localStorage.setItem('acai_orders_backup', JSON.stringify(orders));
      console.log('📱 Pedido salvo LOCALMENTE (fallback). Será sincronizado depois.');
      return { 
        success: false, 
        message: 'Pedido salvo localmente. Será sincronizado quando a conexão melhorar.' 
      };
    } catch (e) {
      return { success: false, message: 'Erro na conexão com Google Sheets' };
    }
  }
}

/**
 * Sincroniza pedidos pendentes (salvos localmente)
 */
export async function syncPendingOrders(apiUrl: string = getGoogleSheetsApiUrl()): Promise<number> {
  try {
    const orders = JSON.parse(localStorage.getItem('acai_orders_backup') || '[]');
    const pendingOrders = orders.filter((o: any) => !o.synced);
    
    if (pendingOrders.length === 0) return 0;
    
    let syncedCount = 0;
    for (const order of pendingOrders) {
      try {
        const result = await sendOrderToGoogleSheets(order, apiUrl);
        if (result.success) {
          order.synced = true;
          syncedCount++;
        }
      } catch (e) {
        console.error('Erro ao sincronizar pedido pendente:', e);
      }
    }
    
    // Atualiza o localStorage
    localStorage.setItem('acai_orders_backup', JSON.stringify(orders));
    return syncedCount;
  } catch (error) {
    console.error('Erro na sincronização de pedidos pendentes:', error);
    return 0;
  }
}

// ===== DEMAIS FUNÇÕES MANTIDAS =====

export async function syncProductsToGoogleSheets(
  products: Product[],
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<boolean> {
  if (!apiUrl) return false;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'syncProducts', products })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao sincronizar produtos com Google Sheets:', error);
    return false;
  }
}

export async function syncAddonsToGoogleSheets(
  addons: AddonItem[],
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<boolean> {
  if (!apiUrl) return false;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'syncAddons', addons })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao sincronizar adicionais com Google Sheets:', error);
    return false;
  }
}

export async function syncSettingsToGoogleSheets(
  storeSettings: StoreSettings,
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<boolean> {
  if (!apiUrl) return false;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'syncSettings', storeSettings })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao sincronizar configurações com Google Sheets:', error);
    return false;
  }
}

export async function syncOrderStatusToGoogleSheets(
  orderId: string,
  newStatus: string,
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<boolean> {
  if (!apiUrl) return false;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateOrderStatus', orderId, status: newStatus })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao atualizar status do pedido no Google Sheets:', error);
    return false;
  }
}
