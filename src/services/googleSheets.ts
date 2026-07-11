// Google Sheets Database API Integration Service - VERSÃO CELULAR
// Otimizada para funcionar em dispositivos móveis

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
 * Pega a URL da API do Google Sheets configurada pelo usuário
 */
export function getGoogleSheetsApiUrl(): string {
  const savedUrl = localStorage.getItem('acai_google_sheets_url');
  if (savedUrl && savedUrl.trim() !== '') {
    return savedUrl.trim();
  }
  if (import.meta.env.VITE_GOOGLE_SHEETS_API_URL) {
    return import.meta.env.VITE_GOOGLE_SHEETS_API_URL.trim();
  }
  return '';
}

export function setGoogleSheetsApiUrl(url: string): void {
  localStorage.setItem('acai_google_sheets_url', url.trim());
}

/**
 * Carrega todos os dados do Google Sheets
 */
export async function fetchAllFromGoogleSheets(apiUrl: string = getGoogleSheetsApiUrl()): Promise<GoogleSheetsDatabase | null> {
  if (!apiUrl) {
    console.warn('Google Sheets API URL não configurada.');
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
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data: GoogleSheetsDatabase = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na sincronização de leitura:', error);
    return null;
  }
}

/**
 * ============================================================
 * FUNÇÃO ESPECIAL PARA CELULAR - Envia pedido via IMAGEM (GET)
 * ============================================================
 * Isso contorna o CORS no celular porque o Google Apps Script
 * aceita parâmetros via GET também!
 */
export async function sendOrderToGoogleSheets(
  order: OrderRecord,
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<{ success: boolean; message?: string }> {
  if (!apiUrl) {
    console.warn('API não configurada. Pedido salvo localmente.');
    return { success: false, message: 'API não configurada' };
  }

  try {
    // === MÉTODO 1: Tenta via GET (funciona em TODOS os navegadores) ===
    const orderData = {
      id: order.id,
      createdAt: order.createdAt,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      deliveryMethod: order.customer.deliveryMethod,
      address: order.customer.deliveryMethod === 'delivery' 
        ? `${order.customer.street}, ${order.customer.number} - ${order.customer.neighborhood}`
        : 'Retirada no Balcão',
      itemsSummary: order.items.map(i => `${i.quantity}x ${i.productName}`).join(' | '),
      itemsJson: JSON.stringify(order.items),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.customer.paymentMethod,
      changeFor: order.customer.changeFor || '',
      status: order.status || 'Pendente'
    };

    // Converte os dados para URL encoded
    const params = new URLSearchParams();
    params.append('action', 'saveOrder');
    params.append('order', JSON.stringify(orderData));

    // Tenta enviar via GET (funciona no celular!)
    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json().catch(() => ({ success: true }));
      return { success: true, message: result.message || 'Pedido salvo!' };
    }

    // === MÉTODO 2: Fallback para POST (como estava antes) ===
    console.warn('GET falhou, tentando POST...');
    const postResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'saveOrder',
        order: orderData
      }),
    });

    if (postResponse.ok) {
      const result = await postResponse.json().catch(() => ({ success: true }));
      return { success: true, message: result.message || 'Pedido salvo!' };
    }

    throw new Error(`HTTP ${postResponse.status}`);

  } catch (error) {
    console.error('Erro ao enviar pedido:', error);
    
    // === SALVAR LOCALMENTE COMO FALLBACK ===
    try {
      const orders = JSON.parse(localStorage.getItem('acai_orders_backup') || '[]');
      orders.push({ 
        ...order, 
        synced: false, 
        timestamp: new Date().toISOString(),
        syncAttempts: (order as any).syncAttempts || 0 + 1
      });
      localStorage.setItem('acai_orders_backup', JSON.stringify(orders));
      return { 
        success: false, 
        message: 'Pedido salvo localmente. Será sincronizado depois.' 
      };
    } catch (e) {
      return { success: false, message: 'Erro na conexão' };
    }
  }
}

/**
 * Sincroniza pedidos pendentes
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
    
    localStorage.setItem('acai_orders_backup', JSON.stringify(orders));
    return syncedCount;
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return 0;
  }
}

// ===== DEMAIS FUNÇÕES =====

export async function syncProductsToGoogleSheets(
  products: Product[],
  apiUrl: string = getGoogleSheetsApiUrl()
): Promise<boolean> {
  if (!apiUrl) return false;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'syncProducts', products })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao sincronizar produtos:', error);
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
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'syncAddons', addons })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao sincronizar adicionais:', error);
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
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'syncSettings', storeSettings })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao sincronizar configurações:', error);
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
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateOrderStatus', orderId, status: newStatus })
    });
    return response.ok;
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return false;
  }
}
