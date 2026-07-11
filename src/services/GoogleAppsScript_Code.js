// ============================================================================
// TEMPLATE: CÓDIGO GOOGLE APPS SCRIPT PARA O AÇAÍ SUPREMO OURO
// ============================================================================
//
// COMO CONECTAR SEU GOOGLE SHEETS EM 3 PASSOS SIMPLES:
// 1. Crie uma nova planilha no Google Sheets e renomeie para "Açaí Supremo - Banco de Dados".
// 2. No menu superior da planilha, clique em: Extensões ➡️ Apps Script.
// 3. Apague todo o código que vier no editor e COLE TODO ESTE ARQUIVO (Código abaixo).
// 4. Clique em "Implantar" (Deploy) ➡️ "Nova Implantação" (New deployment).
//    - Selecione o tipo: App da Web (Web App).
//    - Executar como: Eu (Me - seu e-mail).
//    - Quem pode acessar: Qualquer pessoa (Anyone).
// 5. Clique no botão azul "Implantar", autorize o acesso à sua conta Google e COPIE A URL DO WEB APP GERADA!
// 6. Cole essa URL no painel do Lojista da sua loja (ou na variável de ambiente VITE_GOOGLE_SHEETS_API_URL).
//
// ============================================================================

function doGet(e) {
  var action = e && e.parameter && e.parameter.action ? e.parameter.action : 'getAllData';
  
  if (action === 'getAllData') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Verifica e cria abas caso não existam no primeiro acesso
    ensureTabsExist(ss);
    
    var result = {
      products: readProducts(ss),
      addons: readAddons(ss),
      categories: readCategories(ss),
      storeSettings: readSettings(ss),
      orders: readOrders(ss)
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: "OK", message: "Açaí Supremo Google Sheets API está ativa!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var payload = JSON.parse(rawData);
    var action = payload.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ensureTabsExist(ss);
    
    if (action === 'saveOrder') {
      saveOrderToSheet(ss, payload.order);
      return responseJson({ success: true, message: "Pedido gravado com sucesso!" });
    }
    
    if (action === 'syncProducts') {
      writeProductsToSheet(ss, payload.products);
      return responseJson({ success: true, message: "Produtos atualizados!" });
    }
    
    if (action === 'syncAddons') {
      writeAddonsToSheet(ss, payload.addons);
      return responseJson({ success: true, message: "Adicionais atualizados!" });
    }
    
    if (action === 'syncSettings') {
      writeSettingsToSheet(ss, payload.storeSettings);
      return responseJson({ success: true, message: "Configurações atualizadas!" });
    }
    
    if (action === 'updateOrderStatus') {
      updateOrderStatusInSheet(ss, payload.orderId, payload.status);
      return responseJson({ success: true, message: "Status do pedido alterado!" });
    }
    
    return responseJson({ success: false, message: "Ação desconhecida" });
  } catch (error) {
    return responseJson({ success: false, message: error.toString() });
  }
}

function responseJson(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ----------------------------------------------------------------------------
// FUNÇÕES DE CRIAÇÃO AUTOMÁTICA DE ABAS E LEITURA/GRAVAÇÃO
// ----------------------------------------------------------------------------

function ensureTabsExist(ss) {
  var requiredTabs = ["Pedidos", "Produtos", "Adicionais", "Categorias", "Configuracoes"];
  requiredTabs.forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      if (tabName === "Pedidos") {
        sheet.appendRow(["ID do Pedido", "Data e Hora", "Cliente", "Telefone", "Entrega/Retirada", "Endereço Completo", "Resumo dos Itens", "Subtotal (R$)", "Taxa Frete (R$)", "Desconto (R$)", "Total Pago (R$)", "Forma Pagamento", "Troco", "Status"]);
        sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#4C1D95").setFontColor("#FBBF24");
      } else if (tabName === "Produtos") {
        sheet.appendRow(["id", "name", "description", "price", "image", "categoryId", "isCustomizable", "isAvailable", "isBestSeller", "isGoldGourmet", "badge", "sizesJson"]);
        sheet.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#4C1D95").setFontColor("#FBBF24");
      } else if (tabName === "Adicionais") {
        sheet.appendRow(["id", "name", "price", "category", "isPopular"]);
        sheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#4C1D95").setFontColor("#FBBF24");
      } else if (tabName === "Configuracoes") {
        sheet.appendRow(["Chave", "Valor"]);
        sheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#4C1D95").setFontColor("#FBBF24");
        sheet.appendRow(["storeName", "AÇAÍ SUPREMO OURO"]);
        sheet.appendRow(["slogan", "O Sabor Púrpura & Dourado da Realeza Amazônica"]);
        sheet.appendRow(["whatsappNumber", "5511998765432"]);
        sheet.appendRow(["deliveryFee", "5.00"]);
        sheet.appendRow(["freeDeliveryThreshold", "60.00"]);
        sheet.appendRow(["openingHours", "Seg a Dom das 13h00 às 23h30"]);
        sheet.appendRow(["avgDeliveryTime", "30 - 45 min"]);
        sheet.appendRow(["isOpen", "true"]);
        sheet.appendRow(["pixKey", "acai.supremo.ouro@pix.com.br"]);
        sheet.appendRow(["pixType", "E-mail ou CNPJ 44.333.222/0001-99"]);
        sheet.appendRow(["address", "Av. Paulista, 1800 - Bela Vista, São Paulo - SP"]);
      }
    }
  });
}

function saveOrderToSheet(ss, ord) {
  var sheet = ss.getSheetByName("Pedidos");
  if (!sheet) {
    ensureTabsExist(ss);
    sheet = ss.getSheetByName("Pedidos");
  }
  sheet.appendRow([
    ord.id,
    ord.createdAt,
    ord.customerName,
    ord.customerPhone,
    ord.deliveryMethod,
    ord.address,
    ord.itemsSummary,
    ord.subtotal,
    ord.deliveryFee,
    ord.discount,
    ord.total,
    ord.paymentMethod,
    ord.changeFor,
    ord.status || "Pendente"
  ]);
}

function readOrders(ss) {
  var sheet = ss.getSheetByName("Pedidos");
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  
  var orders = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row[0]) {
      orders.push({
        id: String(row[0]),
        createdAt: String(row[1]),
        customer: {
          name: String(row[2]),
          phone: String(row[3]),
          deliveryMethod: String(row[4]),
          street: String(row[5]),
          number: "",
          neighborhood: "",
          complement: "",
          reference: "",
          paymentMethod: String(row[11]),
          changeFor: String(row[12])
        },
        itemsSummary: String(row[6]),
        subtotal: Number(row[7]) || 0,
        deliveryFee: Number(row[8]) || 0,
        discount: Number(row[9]) || 0,
        total: Number(row[10]) || 0,
        status: String(row[13] || "Pendente"),
        items: []
      });
    }
  }
  return orders.reverse();
}

function readProducts(ss) {
  var sheet = ss.getSheetByName("Produtos");
  if (!sheet) return null;
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return null;
  
  var products = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row[0]) {
      var sizes = null;
      try { if (row[11]) sizes = JSON.parse(row[11]); } catch(e) {}
      products.push({
        id: String(row[0]),
        name: String(row[1]),
        description: String(row[2]),
        price: Number(row[3]) || 0,
        image: String(row[4]),
        categoryId: String(row[5]),
        isCustomizable: row[6] === true || String(row[6]).toLowerCase() === "true",
        isAvailable: row[7] === true || String(row[7]).toLowerCase() === "true",
        isBestSeller: row[8] === true || String(row[8]).toLowerCase() === "true",
        isGoldGourmet: row[9] === true || String(row[9]).toLowerCase() === "true",
        badge: row[10] ? String(row[10]) : undefined,
        sizes: sizes
      });
    }
  }
  return products;
}

function writeProductsToSheet(ss, products) {
  var sheet = ss.getSheetByName("Produtos");
  if (!sheet) { ensureTabsExist(ss); sheet = ss.getSheetByName("Produtos"); }
  
  // Limpa linhas antigas preservando o cabeçalho
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  
  products.forEach(function(prod) {
    sheet.appendRow([
      prod.id,
      prod.name,
      prod.description,
      prod.price,
      prod.image,
      prod.categoryId,
      prod.isCustomizable,
      prod.isAvailable,
      prod.isBestSeller || false,
      prod.isGoldGourmet || false,
      prod.badge || "",
      prod.sizes ? JSON.stringify(prod.sizes) : ""
    ]);
  });
}

function readAddons(ss) {
  var sheet = ss.getSheetByName("Adicionais");
  if (!sheet) return null;
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return null;
  
  var addons = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row[0]) {
      addons.push({
        id: String(row[0]),
        name: String(row[1]),
        price: Number(row[2]) || 0,
        category: String(row[3]),
        isPopular: row[4] === true || String(row[4]).toLowerCase() === "true"
      });
    }
  }
  return addons;
}

function writeAddonsToSheet(ss, addons) {
  var sheet = ss.getSheetByName("Adicionais");
  if (!sheet) { ensureTabsExist(ss); sheet = ss.getSheetByName("Adicionais"); }
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  addons.forEach(function(add) {
    sheet.appendRow([
      add.id,
      add.name,
      add.price,
      add.category,
      add.isPopular || false
    ]);
  });
}

function readSettings(ss) {
  var sheet = ss.getSheetByName("Configuracoes");
  if (!sheet) return null;
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return null;
  
  var obj = {};
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (row[0]) {
      var key = String(row[0]);
      var val = row[1];
      if (key === "deliveryFee" || key === "freeDeliveryThreshold" || key === "minimumOrder") val = Number(val);
      if (key === "isOpen") val = (String(val).toLowerCase() === "true" || val === true);
      obj[key] = val;
    }
  }
  return obj;
}

function writeSettingsToSheet(ss, settings) {
  var sheet = ss.getSheetByName("Configuracoes");
  if (!sheet) { ensureTabsExist(ss); sheet = ss.getSheetByName("Configuracoes"); }
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  Object.keys(settings).forEach(function(key) {
    sheet.appendRow([key, settings[key]]);
  });
}

function updateOrderStatusInSheet(ss, orderId, newStatus) {
  var sheet = ss.getSheetByName("Pedidos");
  if (!sheet) return;
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(orderId)) {
      sheet.getRange(i + 1, 14).setValue(newStatus);
      break;
    }
  }
}
