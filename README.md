# 🍧 Catálogo Digital Profissional para Loja de Açaí — Açaí Supremo Ouro & Púrpura

O **Açaí Supremo Ouro** é um aplicativo PWA (Progressive Web App) moderno, ágil, seguro e 100% responsivo para lojas de Açaí Gourmet. Ele funciona como um catálogo interativo e montador personalizado ("Monte do Seu Jeito") onde o cliente escolhe o tamanho do copo ou barca, adiciona frutas, doces, crocantes e coberturas à vontade e, ao finalizar, é redirecionado automaticamente para o WhatsApp da loja com uma mensagem organizada, formatada e pronta para o atendente confirmar o pagamento.

---

## 🎨 Paleta de Cores & Design
O layout foi concebido com uma estética visual luxuosa inspirada na realeza amazônica do açaí:
- **Roxo Profundo (`#4C1D95` e `#3B0764`)**: Representando a cremosidade e riqueza do legítimo açaí amazônico.
- **Ouro Gourmet (`#F59E0B`, `#D97706` e `#FBBF24`)**: Destaques, bordas brilhantes, coroas e emblemas de qualidade superior.
- **Branco Puro (`#FFFFFF`)**: Garantindo leitura limpa, contraste perfeito e acessibilidade visual.
- **Verde Esmeralda (`#10B981`)**: Para confirmações de pedido, frete grátis e integração com o WhatsApp.

---

## 🚀 Funcionalidades Principais

### 1. Banner & Informações em Tempo Real
- Logo da loja e status (**🟢 Loja Aberta - Recebendo Pedidos** ou **🛑 Loja Fechada**).
- Horário de funcionamento (`Seg a Dom das 13h às 23h30`).
- Tempo médio de entrega (`30 - 45 min`).
- Taxa de entrega configurável e cálculo de frete grátis.
- Botão de contato rápido direto com o WhatsApp da loja.
- Carrossel de avaliações verídicas de clientes (**4.9/5.0 estrelas**).

### 2. Catálogo Interativo & Categorias
- **Açaí Tradicional** (Potes puros de 300ml a 1 Litro)
- **Copos Montados** (O coração da loja: personalizáveis com camadas ilimitadas)
- **Barcas Gourmet** (Barcas 500ml e Família 1.2L com divisórias)
- **Combos & Promos** (Ofertas especiais de economia)
- **Milk Shakes & Cremes** (Creme de Leite Ninho, Creme de Cupuaçu, etc.)
- **Bebidas Geladas & Adicionais Avulsos**
- Sistema de busca instantânea e filtros por **Mais Vendidos**, **Apenas Disponíveis** e **Meus Favoritos ❤️**.

### 3. Personalização do Pedido ("Monte do Seu Jeito")
Ao clicar em **Personalizar** em qualquer Copo ou Barca:
- Escolha de **Tamanho**: `300ml`, `500ml`, `700ml`, `1 Litro`.
- **Adicionais Ilimitados** divididos em abas com seletor de quantidade e checkboxes:
  - 🍓 **Frutas**: Banana, Morango, Kiwi, Manga, Uva.
  - 🍫 **Doces**: Leite condensado, Nutella, Doce de Leite, Paçoca, Ouro Branco, KitKat, M&Ms.
  - 🥣 **Crocantes**: Granola artesanal, Castanha do Pará, Amendoim, Sucrilhos, Leite em Pó Ninho.
  - 🍯 **Coberturas**: Chocolate, Morango, Caramelo, Mel.
- **Observações do Produto** (Ex: `"Caprichar na Nutella no meio do copo, sem leite em pó por cima."`).
- Calculadora de preço em tempo real com atualização instantânea.

### 4. Carrinho de Compras & Checkout
- Resumo com quantidade, subtotal, taxa de entrega e total geral.
- Opção de **Editar** item no carrinho (reabre o montador com os adicionais selecionados).
- Cupom de desconto (`ACAI10` para 10% OFF ou `OURO2026`).
- Seletor de recebimento: **🛵 Delivery na Porta** vs **🏪 Retirar na Loja (R$ 0,00)**.
- Seletor de pagamento: **PIX** (exibe a chave instantânea), **Cartão** (Maquininha) ou **Dinheiro** (exibe pergunta automática: *"Troco para quanto?"*).

### 5. Envio de Mensagem WhatsApp Organizada e Codificada
Ao clicar em **Finalizar Pedido • Enviar no WhatsApp**, o aplicativo gera automaticamente o modelo exato solicitado e redireciona com `encodeURIComponent`:

```text
🍧 NOVO PEDIDO - AÇAÍ SUPREMO OURO

👤 Cliente:
Nome: Ana Clara Silva

📞 Telefone:
Telefone: (11) 99888-7777

📍 Endereço:
Rua das Flores, Nº 450
Bairro: Bela Vista
Complemento: Apto 12B

🛍️ Pedido

• 1x Copo Açaí Supremo (500ml) - R$ 34,50
Adicionais:
✔ Banana
✔ Morango
✔ Nutella
✔ Granola
Observação: Caprichar no meio do copo.

Subtotal: R$ 34,50
Entrega: R$ 5,00
💰 Total: R$ 39,50

Pagamento: PIX
Troco: Não precisa.

Gostaria de confirmar meu pedido e realizar o pagamento.
Muito obrigado!
```

---

## 🛡️ Segurança & Otimização
- **Proteção contra XSS & Injeção**: Todas as strings de entrada (`sanitizedString`, `sanitizeForWhatsApp`) passam por filtragem estrita que remove tags HTML, tentativas de script e iframes antes de renderização ou montagem de URL.
- **Rate Limit Anti-Spam**: Mecanismo com cooldown de 6 segundos embutido no envio de pedidos (`checkRateLimit`) para impedir disparos automatizados ou duplo clique acidental.
- **Validadores de Formulário**: Telefone brasileiro (10 a 11 dígitos com DDD autocompletado), validação obrigatória de nome completo e endereço residencial no modo Delivery.
- **Sem chaves privadas expostas**: Configurações de recebimento rodam via chaves públicas ou armazenamento local do lojista.
- **HTTPS Obrigatório**: Compatível em 100% dos navegadores com certificados SSL e regras PWA.

---

## ⚡ Conexão com Google Sheets (Banco de Dados em Tempo Real)
O Açaí Supremo está 100% preparado para rodar conectado diretamente a uma planilha do **Google Sheets** usando a API nativa/Webhook do Google Apps Script (`doGet` / `doPost`). Assim, além de abrir o WhatsApp do cliente com a mensagem pronta, o pedido é gravado automaticamente em uma nova linha na sua planilha!

### Como conectar seu Google Sheets em 2 minutos:
1. Crie uma planilha no [Google Sheets](https://sheets.google.com) chamada **"Açaí Supremo - Banco de Dados"**.
2. No menu superior da planilha, clique em: **Extensões ➡️ Apps Script**.
3. Apague o código inicial do editor e **cole todo o código do arquivo `src/services/GoogleAppsScript_Code.js`** (você também pode clicar no botão *"Copiar Código Apps Script"* direto na aba **⚡ Banco de Dados Google Sheets** dentro do Painel do Lojista).
4. Clique no ícone de disquete para Salvar. Depois no botão azul superior direito **Implantar ➡️ Nova Implantação (Deploy ➡️ New deployment)**:
   - Selecione o tipo: **App da Web (Web App)**.
   - Executar como: **Eu (Me - seu e-mail)**.
   - Quem pode acessar: **Qualquer pessoa (Anyone)** *(Obrigatório para que o catálogo consiga gravar pedidos sem exigir login da conta Google do cliente)*.
5. Clique no botão **Implantar**, autorize o acesso à sua conta e **copie a URL gerada (`https://script.google.com/macros/s/.../exec`)**.
6. Abra o **Painel do Lojista no site ➡️ Aba "⚡ Banco de Dados Google Sheets"**, cole essa URL na caixa e clique em **"Salvar & Conectar Planilha"**!
   *Pronto! As abas `Pedidos`, `Produtos`, `Adicionais`, `Categorias` e `Configuracoes` serão criadas e mantidas sincronizadas em tempo real.*

---

## ⚙️ Painel Administrativo do Lojista
Acesse clicando no botão **"Painel Lojista"** no cabeçalho ou rodapé:
- **Credenciais Padrão / Demo**: Usuário `admin` | Senha `acai2026` (ou clique no botão *"Acesso Demo Rápido"*).
- **Gestão de Produtos**: Cadastrar novos itens com foto personalizada, editar preços, ativar a etiqueta de "Mais Vendido", alterar disponibilidade entre `Em Estoque` e `Esgotado` (sincronizado automaticamente na aba `Produtos` da planilha!).
- **Gestão de Adicionais**: Alterar preços de coberturas ou adicionar novos cremes ao cardápio de montagem (sincronizado na aba `Adicionais`).
- **Configurações Gerais**: Mudar o número do WhatsApp recebedor, alterar taxa de frete, horário de funcionamento ou fechar a loja temporariamente.
- **Conexão Google Sheets**: Cole a URL do Web App, teste a conexão e copie o código backend pronto para o Apps Script.
- **Histórico de Pedidos Recebidos**: Visualize os pedidos gerados e converse direto pelo WhatsApp do cliente.

---

## 🌐 Como Publicar no GitHub e Rodar Liso no GitHub Pages (Sem Erros 404)

O projeto já está 100% configurado com `base: './'` no `vite.config.ts`, caminhos relativos no `index.html` (`manifest.json` / `sw.js` sem barra inicial) e empacotamento otimizado para que **rode liso em qualquer link do GitHub Pages (`https://seu-usuario.github.io/nome-do-repo/`) sem erro 404 de arquivos ou ícones!**

### Opção A: Publicação Automática (Via GitHub Actions) — ⭐ RECOMENDADA
1. Crie um novo repositório no seu GitHub (ex: `acai-supremo`).
2. Suba os arquivos do projeto para o GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: Catálogo Digital Açaí Supremo Ouro"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/acai-supremo.git
   git push -u origin main
   ```
3. No GitHub, vá até a aba **Settings (Configurações)** ➡️ **Pages**.
4. Em **Build and deployment** > **Source**, escolha: **`GitHub Actions`**.
5. **Pronto!** O arquivo `.github/workflows/deploy.yml` que já criamos iniciará o build automaticamente na aba **Actions** e o seu link live estará rodando perfeitamente em:
   👉 **`https://SEU-USUARIO.github.io/acai-supremo/`**

> **Importante:** não selecione `Deploy from a branch` apontando para `main / root`. Essa opção publica o código-fonte e causa exatamente os erros `src/main.tsx 404`, `manifest.json 404` e tela branca. O workflow publica somente a pasta compilada `dist`.

Depois do primeiro deploy, abra o link com `Ctrl + Shift + R` ou em uma janela anônima para evitar cache antigo do Service Worker.

---

### Opção B: Publicação via Terminal / Linha de Comando (`gh-pages`)
Se preferir subir diretamente pelo seu terminal usando o pacote `gh-pages` já instalado:
1. Certifique-se de que o repositório está conectado ao seu GitHub:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/acai-supremo.git
   ```
2. Execute o comando de deploy instantâneo:
   ```bash
   npm run deploy
   ```
   *Esse comando executa o `npm run build` automaticamente e publica a pasta `dist/` direto na branch `gh-pages` do seu repositório.*
3. No GitHub, em **Settings** ➡️ **Pages**, verifique se a branch `gh-pages` está selecionada.
4. O site estará online em minutos no link `https://SEU-USUARIO.github.io/acai-supremo/`.

### Diagnóstico da tela branca
- `contentscript.js`, `MaxListenersExceededWarning` e `ObjectMultiplex` normalmente vêm de extensões do Chrome, como carteira digital, e não do site.
- `src/main.tsx 404` significa que o GitHub está servindo a raiz do repositório em vez do build.
- `manifest.json 404` e `sw.js 404` também desaparecem quando o Pages publica `dist`.
- Confira a aba **Actions**: o workflow precisa terminar com o status verde antes de abrir o endereço.

---

## 📲 Instalação Local (Desenvolvimento)
```bash
# Instalar as dependências do projeto
npm install

# Iniciar o servidor de desenvolvimento
npm run dev

# Testar o build de produção localmente
npm run build
npm run preview
```
