# Handoff — contexto para a próxima sessão (madereira)

Resumo das sessões anteriores do Claude Code. A primeira rodou **na nuvem**, sem acesso ao computador do usuário; a segunda (24/11/2026) rodou **localmente**, no Windows do usuário, e configurou as ferramentas da AWS e do GitHub. Leia tudo antes de começar e siga o `CLAUDE.md` do repositório.

## Sobre o usuário

- Desenvolvedor Node pleno. Prefere respostas em português e diretas, sem explicação de iniciante.
- Repositório: `caiovbs/madereira` (GitHub, público).
- Projeto **só para estudo**: ninguém vai usar em produção.
- Regra de ouro na AWS: **não gastar nada, ficar sempre no free tier.**
- Costuma criar e mergear os PRs ele mesmo.

## O projeto

App web de gestão de madeireira: estoque, vendas e orçamentos, compras, pátio (cortar e aparelhar), entregas (com a "Rota do dia" no mapa) e financeiro.

- **Backend:** `backend/`, NestJS rodando sobre Fastify, com Prisma e PostgreSQL 16. Cada módulo de domínio segue `controllers/`, `dto/`, `use-cases/`, `services/`, `repositories/` e `models/`. O Swagger fica em `/docs`. Escuta em `0.0.0.0:${PORT:-3000}`.
- **Frontend:** `frontend/`, React 19 + Vite 8, TypeScript, React Router, TanStack Query, Tailwind v4 e shadcn/ui (estilo new-york). Ícones do lucide e lint com oxlint. A URL da API vem de `VITE_API_URL` (padrão `http://localhost:3000`). O tema fica em `frontend/src/index.css`: "madeira" é o claro e "vantablack" o escuro, ativado pela classe `.dark` via next-themes.
- **Banco local:** `docker-compose.yml` na raiz, só com o Postgres (usuário, senha e banco são todos `madeireira`).
- **Variáveis do backend:** ver `backend/.env.example`. Inclui `DATABASE_URL`, `PORT` e as variáveis opcionais `DEPOSITO_*`, `OSRM_URL` e `GEOCODE_CONTEXTO` para a Rota do dia.
- **Scripts do backend:** `backend/scripts/` tem `seed.mjs`, `smoke.mjs` e `agendar-hoje.mjs`.
- **Documentação:** `docs/` tem requisitos funcionais e não funcionais, modelo de dados, `design.md` (telas e decisões de UX), arquitetura, um protótipo e `deploy-aws.md`.
- **Ciclo do MVP:** cadastrar → orçar/vender → baixar estoque → pátio → entregar → receber. Fechar uma venda é uma transação única que baixa o estoque, cria as tarefas do pátio, cria a entrega e lança no financeiro.

### Situação atual (avaliada em 24/11/2026)

- O `main` está no merge do PR #8. Só existe a branch `main`, local e no origin; as branches mergeadas foram apagadas.
- PRs já mergeados: #2 (plano de deploy na AWS), #3 (`CLAUDE.md`), #4 (este handoff), #5 (`CLAUDE.local.md` no `.gitignore`), #6 (região do plano de deploy → `us-east-2`), #7 (status do README e handoff) e #8 (CI).
- O frontend já busca todos os dados na API; não há mock. A seção "Status" do README foi atualizada.
- Existe um `tmp.js` não rastreado na raiz, do usuário; não mexer nele.
- **Pendências conhecidas:**
  1. **Não existe login nem autenticação.** O backend não tem nenhum guard.
  2. **Quase não há testes automatizados:** só o `backend/src/app.controller.spec.ts` gerado pelo Nest. O fechamento de venda só é coberto pelo smoke test (`scripts/smoke.mjs`, pela API), não por teste unitário ou de integração no jest.
  3. **Lint do backend com 173 warnings:** as regras `no-unsafe-*` estão como warning (TODO no `eslint.config.mjs`) até os repositórios com delegates do Prisma serem tipados.

### CI (GitHub Actions, PR #8)

- `.github/workflows/ci.yml`: roda em todo PR e em push no `main`, com dois jobs.
  - **Backend** (Node 22 + Postgres 16 como service): `npm ci`, `prisma generate`, `lint:check`, `typecheck`, jest, build, `prisma migrate deploy`, `prisma migrate diff --exit-code` (falha se o schema tiver mudança sem migration) e, num único passo, sobe o mock-geo e a API, roda `seed.mjs` e `smoke.mjs` (62 verificações).
  - **Frontend:** `npm ci`, oxlint e `npm run build`.
- **Sem serviços externos no CI:** `backend/scripts/mock-geo.mjs` imita Nominatim, Photon e OSRM na porta 3999 (respostas determinísticas). A API aponta para ele via `NOMINATIM_URL`, `PHOTON_URL` e `OSRM_URL`; sem essas variáveis, usa os serviços públicos.
- O smoke test cria os próprios dados de teste ("ZZ Teste", "ZZ Teste Rota 1–3") e passa num banco vazio.
- O `.prettierrc` do backend foi alinhado ao código (`semi: true`, `trailingComma: all`). Scripts novos no backend: `lint:check`, `format:check` e `typecheck`.
- **Ainda não há CD:** build de imagens e deploy entram junto com os Dockerfiles e o Terraform.
- Para testar o fluxo do CI localmente sem mexer no banco do usuário: Postgres descartável em outra porta (ex.: `docker run --rm -p 55432:5432 postgres:16-alpine`) e API em outra porta (`PORT=3100`, `API_URL=http://localhost:3100` para os scripts).

## Ambiente local do usuário (Windows 11)

- Shell padrão: PowerShell 5.1 (sem `&&`). Node e Docker instalados; Terraform **não**.
- Instalados na sessão de 24/11/2026:
  - **uv** 0.13.9 (`~/.local/bin`);
  - **AWS CLI** 2.42.3;
  - **GitHub CLI (`gh`)** 2.105.0, autenticado como `caiovbs`.
- Em shells abertos antes dessas instalações o PATH não tem essas ferramentas; recarregar com `$env:Path = [Environment]::GetEnvironmentVariable('Path','User') + ';' + [Environment]::GetEnvironmentVariable('Path','Machine')`.
- No PowerShell 5.1, passar corpo de PR para o `gh` com `--body-file` (strings com aspas quebram como argumento).

## Convenções (resumo do `CLAUDE.md`)

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

## AWS

### Regras do usuário (obrigatórias)

- **Nunca fazer nada na AWS sem permissão explícita do usuário no chat**, nem operação só de leitura: nenhum comando `aws`, chamada do MCP `aws-mcp`, `terraform` ou script que fale com a AWS. Dizer antes o que vai rodar e esperar um sim; cada permissão vale só para aquela ação.
- Para criar, alterar ou apagar recursos, mostrar também o que será criado e o custo estimado.
- Essas regras estão no `CLAUDE.local.md` (não versionado, no `.gitignore`), junto com as regras da AWS.

### Conta e free tier (conferido em 24/11/2026)

- Conta na **"nova experiência"** da AWS, com **projeto em `us-east-2`**. Na nova experiência todos os recursos regionais ficam na região do projeto.
- **Plano FREE, ativo**, com **US$ 100 em créditos** (podem chegar a US$ 200 com atividades extras). Os créditos expiram em **24/05/2027** (prazo de 6 meses). A conta não gera cobrança: quando os créditos ou o prazo acabam, os recursos param.
- EC2 elegíveis na conta nova: `t3.micro`, `t3.small`, `t4g.micro`, `t4g.small`, `c7i-flex.large` e `m7i-flex.large`.
- O IPv4 público custa US$ 0,005/h (cerca de US$ 3,60/mês) e sai dos créditos.

### Agent Toolkit for AWS (configurado em 24/11/2026)

- **Profile do AWS CLI:** `madereira`, região `us-east-2`, login via `aws login` no navegador. A credencial vale 12 h e renova por até 90 dias; quando expirar, o usuário roda `aws login --profile madereira`. Nunca pedir chaves de acesso.
- **`aws configure agent-toolkit`** (roda em `us-east-1` fixo, que é onde o serviço existe):
  - instalou 26 skills da AWS em `~/.claude/skills` (e `~/.agents/skills` para o Codex);
  - criou a entrada global `aws-mcp` em `~/.claude.json` (`uvx mcp-proxy-for-aws@latest https://aws-mcp.us-east-1.api.aws/mcp`), com `"env": { "AWS_MCP_PROXY_PROFILES": "madereira" }` adicionado à mão. Backup do arquivo original: `~/.claude.json.bak-aws-toolkit`;
  - adicionou um hook de atualização automática das skills em `~/.claude/settings.json` (e `~/.codex/hooks.json`).
- **Regras da AWS:** `rules/aws-starter-rules.md` gravado no `CLAUDE.local.md`, entre os marcadores `<!-- BEGIN/END AWS Agent Toolkit rules -->`. O `help_level` foi definido como **MEDIUM** (o usuário pode trocar).
- O prompt sugerido no fim do setup ("make a single page webapp game and deploy it to AWS") **não** foi rodado e não deve ser, porque cria recursos.

### Plano de deploy (detalhes em `docs/deploy-aws.md`)

**Não foi implementado nem testado.**

- **Instância:** uma `t3.micro` com Ubuntu 24.04 e 20 GB de gp3, em **`us-east-2`**, criada via **Terraform** com state local.
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
  - instalar o Terraform (ainda não está na máquina);
  - conferir se o provider AWS do Terraform aceita as credenciais do `aws login` com o profile `madereira`;
  - criar de fato `infra/`, os Dockerfiles e `deploy/`;
  - CD: estender o GitHub Actions para buildar as imagens fora da `t3.micro` (ex.: publicar no GHCR, grátis para repo público).

## Backlog sugerido (ainda não iniciado)

1. Completar o `CLAUDE.md` com os comandos de cada parte, o mapa da arquitetura e as regras de domínio:
   - nunca editar uma migration já aplicada;
   - soft delete ("Desativar", nunca apagar);
   - textos da UI em pt-BR e dinheiro com `formatCurrency`;
   - cores sempre pelos tokens.
2. Criar o `.claude/settings.json` com permissões: liberar lint e test, bloquear `prisma migrate reset` e a leitura do `.env`.
3. Criar hooks: lint depois de cada edição e bloqueio de push no `main`.
4. Criar a skill `/novo-modulo`, que gera um módulo Nest no padrão do projeto.
5. Implementar autenticação e testes do fechamento de venda no jest (o CI já existe). Opcional: `commitlint` + `husky` e uma Action para validar o título dos PRs.
6. Tipar os repositórios do Prisma e voltar as regras `no-unsafe-*` para `error`.
