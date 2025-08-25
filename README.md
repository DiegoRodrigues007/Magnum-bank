# Magnum Bank

Aplicação web de Internet Banking construída em React + TypeScript.
Inclui autenticação JWT, gerenciamento de estado com Redux Toolkit, interceptores Axios com auto-refresh de token, roteamento com React Router, MSW para simular a API, testes automatizados com Jest + Testing Library, otimizações de renderização com React.memo/useMemo e lazy loading de rotas/páginas

Stack:

- React
- Vite
- TypeScript
- Redux Toolkit
- React Router
- Axios
- MSW
- Jest
- testing-library
- jose (JWT)
- Tailwind (UI)

# Rodando localmente

### 1) Pré-requisitos
   - Node 18+
   - npm
### 2) Clone e instale
```js
git clone

cd magnum-bank

npm install
```
### 3) Variáveis de ambiente
Crie um arquivo .env
```js
VITE_USE_MOCKS=true

VITE_API_URL=http://localhost:3000

```
### 4) Subir o app
```js
npm run dev
```
# O que está implementado

### Autenticação & sessão
- **JWT (access + refresh)** assinado via `jose` no MSW (ambiente de mock).
- **Interceptor Axios** injeta `Authorization: Bearer <access>`.
- Em **401**, o interceptor chama **`/auth/refresh`** automaticamente e **repete a requisição** original.
- Endpoints de auth: **`POST /auth/register`**, **`POST /auth/login`**, **`GET /auth/me`**, **`POST /auth/logout`**, **`POST /auth/refresh`**.
- Tokens e usuário são **persistidos no `localStorage`** e reidratados no boot.

> **Importante:** no primeiro acesso é **obrigatório criar uma conta** na tela de login (link *Criar conta*).  
> Na confirmação de transação, a **senha de transação pode ser qualquer valor** (apenas validação de mock).

### Rotas & UI
- **React Router** com rotas públicas (`/login`, `/register`) e **protegidas** (`/`, `/history`).
- **Lazy loading** nas páginas para reduzir bundle inicial.
- **Feedbacks de loading** e estados de erro simples.

### Operações bancárias
- **Dashboard** com saldo e atalho para transferência/extrato.
- **Criação de transações** (PIX/TED) com atualização do **saldo da conta** e inclusão imediata no **extrato**.
- **Extrato** com:
  - filtro por **texto**, **tipo** (PIX/TED…), **período**, **faixa de valor**;
  - **ordenação por data** e **agrupamento por dia**.

### Estado & performance
- **Redux Toolkit**: slices de `auth`, `account` e `transactions` (reducers + thunks).
- **Selectors** dedicados.
- **React.memo** em listas e **useMemo** para filtros/ordenação/agrupamento (evita renders desnecessários).

### Back-end simulado (MSW)
- **MSW (Mock Service Worker)** intercepta as chamadas.
- **`localStorage` como “banco de dados”** com chaves: `mock_users`, `mock_accounts`, `mock_transactions`, `mock_session_email`.
- Endpoints simulados:
  - **Auth:** `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`, `/auth/refresh`
  - **Account:** `/account/me`, `/accounts` (query `userId`), `PATCH /accounts/:id`
  - **Transactions:** `GET /transactions` (suporta `userId`, `type`, `date_gte`, `date_lte`, `amount_gte`, `amount_lte`, `_order`) e `POST /transactions`
- **Regras de negócio no mock**:
  - cria conta automaticamente no primeiro login/registro;
  - ao lançar transação, **atualiza saldo** da conta correspondente;
  - `GET /transactions` já retorna **ordenado** e **filtrado** pelos parâmetros.

### Testes
- **Jest + Testing Library**:
  - testes de **reducers** e **thunks** (`auth`, `account`, `transactions`);
  - testes de **handlers de API** (MSW) com utilitários `jget/jpost/jpatch`.
- **Rodar o test**:
```js
npm test
```
  
## Estrutura de Pastas
```js
magnum-bank/
│ ├─ layouts/
│ │ └─ DashboardLayout.tsx       `Layout padrão autenticado (Sidebar + Topbar + conteúdo)`
│ ├─ mocks/
│ │ ├─ handlers/
│ │ │ ├─ accounts.ts             `GET /account/me, GET /accounts, PATCH /accounts/:id`
│ │ │ ├─ auth.ts                 `/auth/register, /auth/login, /auth/me, /auth/logout, /auth/refresh`
│ │ │ ├─ db.ts                   `"Banco" via localStorage (mock_users, mock_accounts, ...)`
│ │ │ ├─ index.ts                `Export unificado de todos os handlers do MSW`
│ │ │ ├─ test-utils.ts           `Utilitário p/ testes: rota /__test/reset e seed`
│ │ │ └─ transactions.ts         `GET/POST /transactions (filtros/ordenação)`
│ │ ├─ security/
│ │ │ ├─ jwt.ts                  `Assinatura/validação de JWT com jose (mock de auth)`
│ │ │ └─ jwt.test-double.ts      `Versão simplificada p/ Jest (evita issues de ESM)`
│ │ ├─ browser.ts                `Inicializa o worker do MSW no navegador (dev)`
│ │ └─ server.ts                 `Inicializa o MSW em Node (ambiente de testes)`
│ ├─ pages/
│ │ ├─ Home.tsx                  `Dashboard: saldo, atalhos e últimas transações`
│ │ ├─ Login.tsx                 `Tela de login (link para registro)`
│ │ ├─ Register.tsx              `Tela de cadastro (primeiro acesso obrigatório)`
│ │ ├─ StatementPage.tsx         `Extrato: filtros, agrupamento por dia e lista`
│ │ └─ Transfer.tsx              `Fluxo de transferência (PIX/TED) + senha de transação (mock)`
│ ├─ services/
│ │ └─ api.ts                    `Axios + interceptors (Bearer + auto‑refresh em 401)`
│ ├─ store/
│ │ ├─ accountSlice.ts           `Estado/async da conta (saldo, agência, número)`
│ │ ├─ authSlice.ts              `Login/registro, tokens (access/refresh) e usuário`
│ │ ├─ hooks.ts                  ` useAppDispatch/useAppSelector tipados`
│ │ ├─ index.ts                  `Configuração do Redux store (slices + middleware)`
│ │ └─ transactionsSlice.ts      `Lista de transações, filtros e criação de transação`
│ ├─ styles/
│ │ └─ globals.css               `Estilos globais/Tailwind directives`
│ ├─ types/
│ │ ├─ account.ts                `Tipagens de conta`
│ │ ├─ auth.ts                   `Tipagens de auth (User, AuthResponse, etc.)`
│ │ ├─ filters.ts                `Tipos usados pelos filtros de extrato`
│ │ ├─ transaction.ts            `Tipagens de transação (modelo base)`
│ │ └─ txModels.ts               `Modelos compostos p/ store/thunks (inputs e helpers)`
│ ├─ ui/
│ │ ├─ BalanceCard.tsx           `Card de saldo/conta`
│ │ ├─ Modal.tsx                 `Modal genérico (ex.: confirmação de transação)`
│ │ ├─ QuickAction.tsx           `Ações rápidas (Transferir, Extrato, ...)`
│ │ ├─ Sidebar.tsx               `Navegação lateral`
│ │ ├─ StatementFilters.tsx      `Barra de filtros do extrato`
│ │ ├─ Topbar.tsx                `Barra superior (usuário/conta/ações)`
│ │ └─ TxItem.tsx                `Item de transação (memoizado p/ performance)`
│ ├─ utils/
│ │ ├─ format.ts                 ` currency, formatDate, helpers de formatação`
│ │ ├─ propsComparators.ts       `Comparadores para React.memo (ex.: areTxPropsEqual)`
│ │ ├─ transactionEquality.ts    `Igualdade/ordenação estável de transações`
│ │ └─ transactions.ts           `Funções utilitárias (ex.: groupByDayBR)`
│ ├─ App.tsx                     `Rotas (públicas/privadas) e providers de alto nível`
│ ├─ main.tsx                    `Bootstrap do React + Tailwind + MSW (dev)`
│ └─ vite-env.d.ts               `Tipos do Vite (ImportMetaEnv)`
├─ tests/
│ ├─ _api/                       `Testes de integração contra os handlers do MSW`
│ │ ├─ accounts.test.ts          `/account e /accounts`
│ │ ├─ auth.test.ts              `/auth (login/register/me/logout/refresh)`
│ │ ├─ http.ts                   `Helper axios (jget/jpost/jpatch) usado nos testes`
│ │ ├─ setup.ts                  `Sobe o MSW server (Node) e reseta o seed antes de cada teste`
│ │ └─ transactions.test.ts      `/transactions (filtros, ordenação, criação)`
│ ├─ _test_store/                `Testes unitários de reducers/thunks`
│ │ ├─ accountSlice.test.ts
│ │ ├─ authSlice.reducer.test.ts
│ │ ├─ authSlice.thunks.test.ts
│ │ ├─ transactionsSlice.reducer.test.ts
│ │ └─ transactionsSlice.thunks.test.ts
│ ├─ _test_utils/                 `Testes de funções utilitárias (format, comparators, ...)`
│ │ ├─ format.test.ts
│ │ ├─ propsComparators.test.ts
│ │ └─ transactions.test.ts
│ └─ setupTests.ts 
├─ eslint.config.js 
├─ jest.config.cjs                `Config do Jest (transform, mapeamentos, ignore, etc.)`
├─ jest.setup.ts                  `Setup global do Jest (TextEncoder/Decoder, matchMedia, etc.)`
├─ tsconfig.json 
├─ tsconfig.app.json
├─ tsconfig.node.json 
├─ vite.config.ts 
├─ index.html 
└─ README.md 
```

### Decisões técnicas 
- MSW: permite desenvolver e testar como se houvesse um back-end real (inclusive autenticação) sem depender de um servidor externo.
- JWT com refresh: fluxo realista. O Axios atualiza o token sem o usuário perceber e repete a chamada original.
- Redux Toolkit: menos boilerplate nos reducers e nos thunks.
- React.memo/useMemo: evita re-renderizações caras (listas e cálculos de filtros/agrupamentos).
- React Router lazy: split de código por página → app mais leve.
- TypeScript: Tipagem de domínio (User/Account/Transaction/Filters) e segurança em thunks/handlers.
