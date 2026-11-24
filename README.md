# Madeireira

App web de gestão para madeireira: estoque, vendas/orçamentos, compras, pátio (corte/aparelhar), entregas e financeiro num lugar só.

O ciclo central do MVP: **cadastrar madeira → orçar/vender → baixar estoque → preparar no pátio → entregar → receber**. Ao fechar uma venda, o sistema baixa o estoque, gera as tarefas do pátio, cria a entrega e lança o valor no financeiro, tudo numa única transação.

> **Status:** em desenvolvimento, só para estudo. O backend tem todos os módulos do MVP e o frontend já consome a API em todas as telas. Há CI no GitHub Actions (lint, typecheck, build, migrations e um smoke test do fluxo completo pela API). Ainda faltam login/autenticação e testes automatizados de verdade (hoje só o smoke test cobre o fechamento de venda). O deploy na AWS está só planejado ([docs/deploy-aws.md](docs/deploy-aws.md)).

## Stack

| Camada   | Tecnologia |
|----------|------------|
| Frontend | React, Vite, TypeScript, React Router, TanStack Query, Tailwind CSS + shadcn/ui |
| Backend  | Node.js, NestJS, TypeScript, Prisma |
| Banco    | PostgreSQL 16 (Docker Compose) |

## Estrutura

```
madereira/
├── backend/             API NestJS (módulos por domínio)
├── frontend/            App web React + Vite
├── docs/                Requisitos, modelo de dados, design, arquitetura, protótipo
└── docker-compose.yml   PostgreSQL local
```

## Rodando localmente

**Pré-requisitos:** Node.js 22+ e Docker.

**1. Banco de dados**

```bash
docker compose up -d
```

**2. Backend** (http://localhost:3000)

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
```

A documentação interativa da API (Swagger) fica em http://localhost:3000/docs. Também há uma coleção do Postman em [docs/madereira-api.postman_collection.json](docs/madereira-api.postman_collection.json).

**3. Frontend** (http://localhost:5173)

```bash
cd frontend
npm install
npm run dev
```

Por padrão o front aponta para `http://localhost:3000`; para mudar, defina `VITE_API_URL`.

**4. Dados e testes** (com a API rodando, a partir de `backend/`)

```bash
node scripts/seed.mjs    # popula com dados de exemplo
node scripts/smoke.mjs   # teste de integração do fluxo completo pela API
```

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda em todo PR e em push no `main`:

- **Backend:** lint, typecheck, testes unitários e build; aplica as migrations num Postgres 16 e falha se o `schema.prisma` tiver mudança sem migration; sobe a API, roda o seed e o smoke test.
- **Frontend:** oxlint e build (`tsc -b` + Vite).

No CI, a geocodificação e as rotas da Rota do dia usam um mock local ([`backend/scripts/mock-geo.mjs`](backend/scripts/mock-geo.mjs)) no lugar do Nominatim, Photon e OSRM. Para usar o mock localmente, rode `node scripts/mock-geo.mjs` e defina `NOMINATIM_URL`, `PHOTON_URL` e `OSRM_URL` como `http://localhost:3999`.

## Módulos

- **Estoque**: ficha de produto (tipo, estado, medidas), custo, preço, margem e estoque mínimo. A quantidade só muda por entrada (compra) ou baixa (venda), e cada movimento fica registrado.
- **Vendas**: orçamento e venda na mesma tela; o orçamento é um rascunho que pode ser retomado. Itens com instruções de corte/aparelhamento, frete e desconto.
- **Compras**: pedido → recebida. Ao receber, soma o estoque, atualiza o custo e gera o valor a pagar.
- **Pátio**: fila de tarefas de preparo (cortar, aparelhar, separar) geradas pelas vendas.
- **Entregas**: painel com status (a carregar → carregado → em rota → entregue), travado até o pátio concluir o preparo. A visão **Rota do dia** mostra no mapa as entregas agendadas, sugere a ordem de menor distância (manhã antes da tarde, com retorno à madeireira), traça o caminho pelas ruas e permite ajustar a ordem e a posição dos pinos. Usa só serviços gratuitos (OpenStreetMap/OSRM); ver variáveis `DEPOSITO_*` em `backend/.env.example`.
- **Financeiro**: saldo do caixa, contas a receber e a pagar, despesas avulsas.
- **Cadastros**: clientes, fornecedores, funcionários, caminhões e tipos de madeira.

## Documentação

- [Requisitos funcionais](docs/requisitos-funcionais.md)
- [Requisitos não funcionais](docs/requisitos-nao-funcionais.md)
- [Modelo de dados](docs/modelo-de-dados.md)
- [Design das telas](docs/design.md)
- [Arquitetura](docs/arquitetura.md)
- [Protótipo navegável](docs/prototipo/index.html)
- [Deploy na AWS (plano, free tier)](docs/deploy-aws.md)
