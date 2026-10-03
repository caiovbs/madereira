# Requisitos Não-Funcionais — App de Gestão da Madeireira

> **Status:** definidos nesta rodada. Complementam [requisitos-funcionais.md](requisitos-funcionais.md).
> **Escopo:** MVP (itens v2 sinalizados).

---

## 1. Plataforma e tecnologia

- **RNF-P1** — Front-end **web em React**, com uso primário em **desktop/PC** (o trabalho é pesado em escritório: venda, estoque, compra, financeiro — teclado + tela grande).
- **RNF-P2** — Layout **responsivo** (atende tablet/navegador no pátio se necessário), mas **não é app mobile** no MVP. App mobile nativo (React Native) para motorista/cliente = **fase 2**, consumindo a mesma API.
- **RNF-P3** — Back-end **Node.js + TypeScript + NestJS**; banco **PostgreSQL**; empacotamento **Docker**; CI/CD **Harness**.

## 2. Conectividade

- **RNF-C1** — App **online-only** no MVP (internet boa na operação). **Sem suporte offline** — funcionalidade offline/sincronização fica para v2, se um dia for necessário.

## 3. Acesso e hospedagem

- **RNF-A1** — **MVP roda localmente** (na máquina do desenvolvedor, via Docker — localhost). **Deploy na nuvem adiado** (decisão de não estudar infra agora; não bloqueia a construção).
- **RNF-A2** — **Alvo futuro de deploy: AWS** (EC2/ECS, Secrets Manager para credenciais, S3 para arquivos). Como tudo é **Docker**, o que roda local sobe para o ECS sem reescrever — adiar não gera retrabalho.
- **RNF-A3** — Quando publicado, **HTTPS obrigatório** (trafega dado financeiro pela internet) e segredos no **Secrets Manager**. Localmente, `.env`.
- **RNF-A4** — Acesso de qualquer lugar (PC da loja + casa) passa a valer **só após o deploy na nuvem**; durante o desenvolvimento é local.

## 4. Usuários e segurança

- **RNF-S1** — **Usuário único** no MVP: um login (e-mail/usuário + senha). Autenticação simples.
- **RNF-S2** — Multiusuário e **permissões por papel** = **v2**.
- **RNF-S3** — Credenciais/segredos **fora do código** (variáveis de ambiente).

## 5. Backup

- **RNF-B1** — Rotina de backup própria **adiada (v2)**.
- **Recomendação (não é tarefa do MVP):** usar **Postgres gerenciado** com snapshot automático do provedor — garante proteção básica "de brinde", coerente com hospedagem na nuvem + dados financeiros.

## 6. Documentos e impressão

- **RNF-D1** — Geração de **PDF/impressão adiada (v2)**. No MVP, apenas visualização em tela. (Provável prioridade na v2: orçamento/venda em PDF para enviar no WhatsApp.)

## 7. Comunicação externa

- **RNF-X1** — O app **não substitui o WhatsApp** (canal central do usuário com cliente/fornecedor/motorista; recebe orçamentos por lá). Convivem. **Integração WhatsApp** = fase 2+.

## 8. Localização e desempenho

- **RNF-L1** — Idioma **pt-BR**; moeda **BRL (R$)**.
- **RNF-D2** — **Busca de produto instantânea e tolerante** (ex.: "pinus 5 30") — endereçado na modelagem via `pg_trgm` + nome denormalizado.

---

## Resumo das decisões (MVP × v2)

| Tema | MVP | v2+ |
|---|---|---|
| Plataforma | Web (React) no PC | App mobile (RN): motorista/cliente |
| Offline | Não (online-only) | Talvez, se necessário |
| Hospedagem | Local (Docker, localhost) | Nuvem AWS (EC2/ECS, Secrets Manager, S3) |
| Acesso | Local, durante dev | De qualquer lugar (pós-deploy), HTTPS |
| Usuários | 1 login | Multiusuário + permissões |
| Backup | Adiado | Snapshot Postgres gerenciado / rotina própria |
| Documentos | Só tela | PDF/impressão; orçamento p/ WhatsApp |
| WhatsApp | Convive (manual) | Integração |
