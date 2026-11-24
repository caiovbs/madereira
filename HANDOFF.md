# Handoff — contexto da sessão anterior (madereira)

Este arquivo resume uma sessão anterior do Claude Code, que rodou **na nuvem**, sem acesso ao computador do usuário. Leia tudo antes de começar. Siga também o `CLAUDE.md` do repositório, se ele já estiver no `main`.

## Sobre o usuário

- Desenvolvedor Node pleno. Prefere respostas em português e diretas, sem explicação de iniciante.
- Repositório: `caiovbs/madereira` (GitHub).
- Projeto **só para estudo**: ninguém vai usar em produção.
- Regra de ouro na AWS: **não gastar nada, ficar sempre no free tier.**

## O projeto

App web de gestão de madeireira: estoque, vendas e orçamentos, compras, pátio (cortar e aparelhar), entregas (com a "Rota do dia" no mapa) e financeiro.

- **Backend:** `backend/`, NestJS rodando sobre Fastify, com Prisma e PostgreSQL 16. Cada módulo de domínio segue `controllers/`, `dto/`, `use-cases/`, `services/`, `repositories/` e `models/`. O Swagger fica em `/docs`. Escuta em `0.0.0.0:${PORT:-3000}`.
- **Frontend:** `frontend/`, React 19 + Vite 8, TypeScript, React Router, TanStack Query, Tailwind v4 e shadcn/ui (estilo new-york). Ícones do lucide e lint com oxlint. A URL da API vem de `VITE_API_URL` (padrão `http://localhost:3000`). O tema fica em `frontend/src/index.css`: "madeira" é o claro e "vantablack" o escuro, ativado pela classe `.dark` via next-themes.
- **Banco local:** `docker-compose.yml` na raiz, só com o Postgres (usuário, senha e banco são todos `madeireira`).
- **Variáveis do backend:** ver `backend/.env.example`. Inclui `DATABASE_URL`, `PORT` e as variáveis opcionais `DEPOSITO_*`, `OSRM_URL` e `GEOCODE_CONTEXTO` para a Rota do dia.
- **Scripts do backend:** `backend/scripts/` tem `seed.mjs`, `smoke.mjs` e `agendar-hoje.mjs`.
- **Documentação:** `docs/` tem requisitos funcionais e não funcionais, modelo de dados, `design.md` (telas e decisões de UX), arquitetura e um protótipo.
- **Ciclo do MVP:** cadastrar → orçar/vender → baixar estoque → pátio → entregar → receber. Fechar uma venda é uma transação única que baixa o estoque, cria as tarefas do pátio, cria a entrega e lança no financeiro.

### Situação atual (avaliada em 23/11/2026)

- O `main` está em `5c7f51d`, o merge do PR #1 (`feat/backend-fastify`). As branches `feat/integracao-front-back` e `feat/backend-fastify` já estão mergeadas e podem ser apagadas.
- O frontend já busca todos os dados na API; não há mock.
- **Pendências conhecidas:**
  1. **Não existe login nem autenticação.** O backend não tem nenhum guard.
  2. **Quase não há testes:** só o `backend/src/app.controller.spec.ts` gerado pelo Nest. A transação de fechar venda não tem teste.
  3. **Não há CI:** não existe `.github/`.
  4. **README desatualizado:** ainda diz que o front usa "dados de exemplo", e isso não é mais verdade.
- Nenhum build ou typecheck foi rodado na sessão anterior, porque não havia `node_modules`.

## PRs abertos pela sessão anterior

| PR | Branch | Conteúdo |
|---|---|---|
| [#2](https://github.com/caiovbs/madereira/pull/2) | `claude/design-system-extraction-khwbqi` | `docs/deploy-aws.md` (plano de deploy na AWS) e link no README |
| [#3](https://github.com/caiovbs/madereira/pull/3) | `chore/claude-conventions` | `CLAUDE.md` com as convenções abaixo |

- **PR #2:** o título está em português e a branch usa o nome automático da nuvem, porque foi aberto antes de existir a convenção. O usuário ainda não decidiu se padroniza; o título sugerido é `docs: add AWS free-tier deploy plan`.
- **Se os PRs ainda não foram mergeados:** os arquivos acima só existem nessas branches.

## Convenções (conteúdo do `CLAUDE.md`, PR #3)

- **Commits:** Conventional Commits (`<tipo>(<escopo>): <descrição>`).
  - Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
  - Escopos: `backend`, `frontend`, `infra`, `docs`.
  - Descrição em inglês, no imperativo, minúscula e sem ponto final.
  - Breaking change: `!` depois do tipo e rodapé `BREAKING CHANGE:`.
- **Branches:** `<tipo>/<descricao-em-kebab-case>`, criadas a partir do `main`, nunca `claude/...`.
- **PRs:** título no formato do commit principal, em inglês. O corpo diz o que muda, por quê e como foi testado.

## Design system

Foi extraído do frontend e publicado como artifact no claude.ai: **https://claude.ai/artifact/XBAAb3hA6VkcVPFENaUW6s**. Ele **não** está no repositório.

- **Temas:** Madeira (claro) e Vantablack (escuro).
- **Cores:**
  - Madeira: `primary` #1f6b55 (verde-floresta), `background` #f5f3ee (papel quente), `sidebar` #1b2520, `accent` âmbar #f6ecd6 e `sidebar-accent` #f2c25c.
  - Vantablack: `primary` #d9a24a (âmbar), fundo #000 e superfícies separadas por bordas de 1px, sem sombra.
  - Também tem os tokens de status `status-{neutral,success,warning,danger,info}` com o fundo `-bg`, além de `positive`/`negative` e `heading`, `text-body`, `divider` e `surface-sunken`.
- **Tipografia:** Fraunces só para títulos de página, marca, títulos de diálogo e saldo do caixa; Geist para todo o resto. Estilos principais: `page-title` 28px/720, `ui` 13px/650, `body` 14px e os rótulos em caixa alta (`eyebrow`, `field-label`, `table-head`).
- **Espaçamento:** 32, 24, 20, 14, 9 e 8px. **Raios:** 4, 5, 6, 7, 8, 12px e pill.
- **Componentes documentados:** Button, IconButton, FilterButton, SearchField, Field, StatusBadge, Tag, MetricCard, PageHeader, SectionTitle, DataTable, ViewTabs e Sidebar. As previews são estáticas.
- **Falhas de contraste no tema claro**, mantidas como estão no código:
  - `muted-foreground` sobre `background` dá 4,1:1;
  - o `ring` sobre `card` dá 2,4:1;
  - `.muted` (#77867f) sobre branco dá 3,8:1.
- **Regra para código novo:** usar sempre os tokens do `index.css`, nunca hex solto.

## AWS — o que já foi decidido

### Conta e free tier

- O usuário logou na AWS na **"nova experiência"** (conta no modelo novo, a partir de 15/07/2025), com **projeto em `us-east-2`**.
- **Conta nova, plano Free:**
  - US$ 100 em créditos, que podem chegar a US$ 200 com atividades extras.
  - A conta não gera cobrança: quando os créditos ou o prazo acabam, os recursos param.
  - O prazo é de 6 ou 12 meses; as fontes divergem, conferir em Billing → Credits.
  - **Confirmar em Billing que o plano é Free, e não Paid.**
- EC2 elegíveis na conta nova: `t3.micro`, `t3.small`, `t4g.micro`, `t4g.small`, `c7i-flex.large` e `m7i-flex.large`.
- O IPv4 público custa US$ 0,005/h (cerca de US$ 3,60/mês) e sai dos créditos.

### Plano de deploy (detalhes completos em `docs/deploy-aws.md`, PR #2)

**Não foi implementado nem testado.**

- **Instância:** uma `t3.micro` com Ubuntu 24.04 e 20 GB de gp3, criada via **Terraform** com state local.
- **`user_data`:** cria 2 GB de swap (1 GB de RAM não aguenta o `npm ci`) e instala o Docker.
- **Security group:** libera as portas 22 e 80 **só para o IP do usuário**. Fica sem domínio e sem HTTPS, o que é aceitável porque não há login e é só estudo.
- **Alerta:** `aws_budgets_budget` de US$ 1/mês.
- **Na VM, via Docker Compose (`deploy/docker-compose.prod.yml`):**
  - Postgres sem porta exposta;
  - API buildada pelo `backend/Dockerfile` (node:22-slim com openssl), que roda `prisma migrate deploy` antes de `node dist/main`;
  - `web`: Caddy servindo o build do front (feito com `VITE_API_URL=/api`) e fazendo proxy de `/api/*` → `api:3000`.
- **Atenção no Dockerfile:** o `npm prune --omit=dev` remove o CLI `prisma` usado no `migrate deploy`. Mover `prisma` para `dependencies` ou ajustar o Dockerfile.
- **Fluxo:** `terraform apply -var meu_ip=$(curl -s ifconfig.me)/32 -var email=...`, depois SSH, `git clone`, criar `.env` com `DB_PASSWORD` e rodar `docker compose ... up -d --build`. **Rodar `terraform destroy` ao terminar de estudar.**
- **A fazer:**
  - trocar a região do plano de `us-east-1` para **`us-east-2`**, onde está o projeto;
  - criar de fato `infra/`, os Dockerfiles e `deploy/`;
  - opcional: GitHub Actions para buildar as imagens fora da `t3.micro`.

## Tarefa imediata desta sessão: configurar o Agent Toolkit for AWS

Instruções oficiais: https://raw.githubusercontent.com/aws/agent-toolkit-for-aws/refs/heads/main/setup-instructions/setup.md

- **Região:** `us-east-2`. **Experiência:** nova. **Profile sugerido:** `madereira`.
- **O que o setup faz:**
  - instala o `uv` e o AWS CLI v2 (com uma linha de PATH no `~/.bashrc` ou `~/.zshrc`);
  - faz `aws login` pelo navegador (a credencial vale 12 h e renova por até 90 dias, nunca peça chaves);
  - roda `aws configure agent-toolkit`, que, segundo as instruções da AWS, usa **us-east-1 fixo** mesmo com o projeto em us-east-2;
  - adiciona `"env": { "AWS_MCP_PROXY_PROFILES": "madereira" }` na entrada `aws-mcp` do config de MCP;
  - instala as regras da AWS (para conta nova, `rules/aws-starter-rules.md`).
- **Restrições do usuário:**
  - **Nunca criar, alterar ou apagar recursos na AWS sem mostrar antes o que será criado e o custo estimado.**
  - No passo 7, **não** escrever as regras da AWS no `CLAUDE.md` versionado: usar `CLAUDE.local.md` e colocá-lo no `.gitignore`.
  - **Não** rodar o prompt sugerido no final do setup ("make a single page webapp game and deploy it to AWS"), porque ele cria recursos.

## Backlog sugerido (ainda não iniciado)

1. Completar o `CLAUDE.md` com os comandos de cada parte, o mapa da arquitetura e as regras de domínio:
   - nunca editar uma migration já aplicada;
   - soft delete ("Desativar", nunca apagar);
   - textos da UI em pt-BR e dinheiro com `formatCurrency`;
   - cores sempre pelos tokens.
2. Criar o `.claude/settings.json` com permissões: liberar lint e test, bloquear `prisma migrate reset` e a leitura do `.env`.
3. Criar hooks: lint depois de cada edição e bloqueio de push no `main`.
4. Criar a skill `/novo-modulo`, que gera um módulo Nest no padrão do projeto.
5. Implementar autenticação, testes do fechamento de venda e CI (lint, typecheck e build). Opcional: `commitlint` + `husky` e uma Action para validar o título dos PRs.
6. Atualizar a seção "Status" do README.
