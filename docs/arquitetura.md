# Arquitetura — App de Gestão da Madeireira

> Base: [requisitos-funcionais.md](requisitos-funcionais.md), [modelo-de-dados.md](modelo-de-dados.md), [requisitos-nao-funcionais.md](requisitos-nao-funcionais.md), [design.md](design.md).

## Stack
- **Backend:** Node.js + TypeScript + **NestJS**; ORM **Prisma**; **PostgreSQL**.
- **Frontend:** **React** + **Vite** + TypeScript; **React Router**; **TanStack Query** (dados/cache); **Tailwind CSS + shadcn/ui** (reproduz o protótipo).
- **Infra local (MVP):** **Docker Compose** (Postgres). Deploy futuro: **AWS** (EC2/ECS, Secrets Manager, S3) — adiado.

## Estrutura (monorepo de pastas, sem Nx/Turborepo)
```
madereira/
├── backend/            API NestJS
├── frontend/           App web React + Vite
├── docker-compose.yml  Postgres (+ serviços de dev)
└── docs/
```

## Backend — organização
- **Um módulo NestJS por domínio:** `produtos`, `vendas`, `compras`, `patio`, `entregas`, `financeiro`, `cadastros` (clientes/fornecedores/funcionarios/caminhoes), `auth`.
- Cada módulo: `*.controller.ts` (rotas REST) + `*.service.ts` (regra) + `dto/` (validação com class-validator).
- **Prisma** como camada de dados: um `schema.prisma` único (as 14 entidades), `PrismaService` injetável, migrations versionadas.
- **Cascatas transacionais** (Fechar venda / Receber compra) em services dedicados usando `prisma.$transaction` — garante atomicidade (RF-X1).
- **Config/segredos:** `@nestjs/config` + `.env` (local). Em produção, Secrets Manager.
- **Auth:** login único (RNF-S1) com JWT simples. Multiusuário/permissões = v2.

## Frontend — organização
- `src/pages/` por módulo (espelha a navegação do design), `src/components/` (UI shadcn + componentes próprios), `src/api/` (hooks TanStack Query por recurso).
- Layout shell (sidebar + topbar) conforme [design.md](design.md) seção 1.

## Banco de dados (local)
- **Postgres 16 via Docker Compose** (`docker-compose.yml` na raiz), porta 5432, user/db `madeireira`, volume persistente. Subir com `docker compose up -d`.
- `.env` do backend: `DATABASE_URL=postgresql://madeireira:madeireira@localhost:5432/madeireira?schema=public`.
- **Notas de ambiente:** Node **24.16** (Prisma exige 20.19+/22+); Prisma fixado na **6.19.3** (`url` fica no schema, apesar do aviso da extensão v7 do VSCode — o CLI exige). `prisma dev` foi descartado (frágil: versão de Node, porta variável, conexão caía). Se o `docker` não estiver no PATH da sessão, usar a pasta `C:\Program Files\Docker\Docker\resources\bin` (contém `docker` e `docker-credential-desktop`).
- Recursos avançados adiados p/ migration manual depois: `pg_trgm` (busca tolerante), índices parciais. Colunas calculadas (margem/subtotais) ficam no serviço, não no banco.

## Convenções
- Idioma de domínio em pt-BR (nomes de entidades/campos), código em inglês onde fizer sentido.
- IDs `uuid`; timestamps `timestamptz`; dinheiro `numeric`.
- Ordem de construção sugerida ("esqueleto andante"): Cadastros + Produtos → Compras (entrada de estoque) → Vendas (cascata) → Pátio/Entregas → Financeiro.
