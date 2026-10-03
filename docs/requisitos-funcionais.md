# Requisitos Funcionais — App de Gestão da Madeireira

> **Status:** levantamento consolidado a partir do planejamento por módulos.
> **Escopo deste documento:** MVP (com itens v2 sinalizados para contexto).
> **Fora deste documento:** requisitos não-funcionais (conectividade/offline, dispositivos, backup, desempenho, segurança, impressão) — a definir na próxima rodada.

---

## 1. Visão geral

App para unificar a gestão de uma madeireira: estoque, vendas/orçamentos, compras/reposição, beneficiamento no pátio, entregas e financeiro. O objetivo central é que **uma venda dispare, em cascata, todas as consequências** (baixa de estoque, tarefas de pátio, entrega e lançamentos financeiros).

### 1.1 Atores
- **Vendedor/Atendente (escritório)** — ator único do MVP; faz tudo (vende, compra, controla estoque, atualiza entregas, dá baixa no financeiro).
- *(v2)* Aparelhador, Cortador, Carregador, Motorista, Gerente, Cliente.

### 1.2 Princípios gerais
- **RF-G1** — A quantidade em estoque nunca é editada manualmente; muda apenas por movimento (entrada de compra ou baixa de venda), e todo movimento tem origem registrada.
- **RF-G2** — Moeda em R$ (BRL) e interface em português (pt-BR).
- **RF-G3** — A unidade de venda/estoque padrão é a **peça**. (Conversão para m³ é v2.)

---

## 2. Cadastros de apoio

- **RF-C1** — Manter cadastro de **Clientes** (nome, contato, endereço).
- **RF-C2** — Manter cadastro de **Fornecedores**.
- **RF-C3** — Manter cadastro de **Funcionários** (com função: aparelhador, cortador, carregador, motorista).
- **RF-C4** — Manter cadastro de **Caminhões/Veículos**.
- **RF-C5** — Manter listas gerenciadas de **Tipo/Espécie** (pinus, eucalipto, etc.) e **Estado** (bruta, aparelhada), usadas no cadastro de produto (evita texto livre).

---

## 3. Módulo Estoque / Produto

- **RF-E1** — Cadastrar produto com: Tipo, Estado, Espessura (cm), Largura (cm), Comprimento de estoque (m), Custo/peça, Preço de venda/peça, Estoque mínimo.
- **RF-E2** — Gerar o **nome do produto automaticamente** a partir dos atributos (ex.: "Pinus Bruta 5×30 3,00m"); o usuário não digita o nome.
- **RF-E3** — Exibir a **margem** calculada (preço − custo) na ficha; campo somente leitura.
- **RF-E4** — Listar produtos com **busca rápida** tolerante (ex.: "pinus 5 30") e filtros por Tipo e Estado.
- **RF-E5** — Exibir **alerta de estoque baixo** quando Quantidade ≤ Estoque mínimo.
- **RF-E6** — Registrar **entrada de estoque** (atalho "+Entrada"), que internamente cria uma Compra já "Recebida" com 1 item (ver RF-G1).
- **RF-E7** — Manter histórico de movimentos do produto (quando, quanto, origem).
- **RF-E8** — O Estado (bruta/aparelhada) é atributo do produto; "aparelhar" não muda o preço (ver Pátio/Venda).

---

## 4. Módulo Venda / Orçamento

- **RF-V1** — Criar **Orçamento** (rascunho) e, na mesma tela, convertê-lo em **Venda**.
- **RF-V2** — Identificar a venda com Cliente e referência da obra.
- **RF-V3** — Adicionar itens via **busca rápida** em sequência (fluxo "lista do carpinteiro"): buscar produto → quantidade (peças) → adicionar; foco volta para a busca.
- **RF-V4** — Puxar o **preço da ficha** automaticamente, permitindo ajuste por linha.
- **RF-V5** — Por linha, permitir instruções de preparo: **✂ cortar para [medida]** e **🪵 aparelhar (sim/não)** — geram tarefa no Pátio e **não alteram o preço**.
- **RF-V6** — Definir entrega: **Retirada na loja** ou **Entregar** (com endereço, caminhão e motorista).
- **RF-V7** — Calcular total como **Subtotal + Frete − Desconto**; desconto aplicado no total.
- **RF-V8** — Registrar pagamento: forma (pix/dinheiro/cartão/prazo) e status **Pago** ou **A receber**.
- **RF-V9** — **Salvar Orçamento** não altera estoque e **não valida** disponibilidade.
- **RF-V10** — **Fechar Venda** valida estoque e **bloqueia** se a quantidade pedida exceder o disponível.
- **RF-V11** — Ao Fechar Venda, disparar em cascata (ver RF-X1).

---

## 5. Módulo Compra / Reposição

- **RF-CP1** — Exibir **Reposição sugerida**: itens com Quantidade ≤ Estoque mínimo, com ação de adicionar ao pedido.
- **RF-CP2** — Criar **Compra** com Fornecedor e itens (produto + quantidade em peças + custo unitário; custo pré-preenchido com o último, editável).
- **RF-CP3** — Estado **Pedido** (encomendado): não altera estoque.
- **RF-CP4** — Ação **Marcar Recebida**: soma ao estoque (entrada), **atualiza o custo da ficha** (último custo, recalcula margem) e gera lançamento no Financeiro.
- **RF-CP5** — Pagamento da compra **à vista ou a prazo**; a prazo exige vencimento e vira "A pagar".

---

## 6. Módulo Pátio / Tarefas

- **RF-P1** — Gerar tarefas automaticamente ao Fechar Venda: **Preparar** (com checklist ☐ cortar para X / ☐ aparelhar) para itens com preparo; **Separar** para vendas de retirada.
- **RF-P2** — Cada tarefa exibe: o que fazer, produto/quantidade e venda/cliente de origem.
- **RF-P3** — Listar tarefas em fila, com filtro padrão **Pendentes**.
- **RF-P4** — Concluir tarefa marcando os passos do checklist (Pendente → Concluída).
- **RF-P5** — **Travar a entrega/retirada** da venda enquanto houver tarefa de pátio pendente.
- **RF-P6** — *(v2)* Atribuir responsável (funcionário) por tarefa para produtividade. No MVP é fila única, sem responsável.

---

## 7. Módulo Entrega / Logística

- **RF-EN1** — Gerar a entrega automaticamente para vendas marcadas como **Entregar** (com cliente, endereço e itens já preenchidos).
- **RF-EN2** — Avançar status: **A carregar → Carregado → Em rota → Entregue**.
- **RF-EN3** — Painel de entregas com filtros por **dia, motorista e status**.
- **RF-EN4** — Atribuir **caminhão e motorista** à entrega.
- **RF-EN5** — Agendamento simples: **data + turno** (manhã/tarde). Sem rota/GPS no MVP.
- **RF-EN6** — No MVP, **apenas o escritório** atualiza o status (sem app/login por motorista).
- **RF-EN7** — A entrega não altera estoque (já baixou na venda); movimenta apenas status.
- **RF-EN8** — Respeitar a trava do Pátio (RF-P5): não permitir "Carregado" antes do preparo concluído.
- **RF-EN9** — *(v2)* Tela do motorista no celular; comprovante de entrega (foto/assinatura).

---

## 8. Módulo Financeiro / Caixa

- **RF-F1** — **Visão geral** com Saldo do caixa, Total a receber e Total a pagar, destacando **vencidos**, e a movimentação do dia.
- **RF-F2** — **Contas a receber**: lista das vendas com pagamento pendente; ação "recebi" dá baixa e lança entrada no caixa.
- **RF-F3** — **Contas a pagar**: lista das compras a prazo; ação "paguei" dá baixa e lança saída no caixa.
- **RF-F4** — **Caixa**: histórico de entradas e saídas (livro caixa).
- **RF-F5** — **Lançamento manual** de entrada/saída avulsa (combustível, salário, luz, manutenção) — garante saldo real.
- **RF-F6** — Alimentação automática: venda paga → entrada; venda a receber → conta a receber; compra paga → saída; compra a prazo → conta a pagar.
- **RF-F7** — *(v2)* Fechamento de caixa diário.

---

## 9. Requisitos transversais

- **RF-X1 — Cascata do "Fechar Venda":** baixa de estoque + geração de tarefas de pátio (corte/aparelhar/separar) + criação da entrega (se aplicável) + lançamento financeiro (pago ou a receber).
- **RF-X2** — Cada módulo a jusante (Pátio, Entrega, Financeiro) é primariamente **visualização do que a Venda gerou**, com ações de avanço de estado.

---

## 10. Fora de escopo do MVP (v2+)

- Conversão de unidade m³ ↔ peça.
- Controle de sobra/refugo do corte.
- Compra sob encomenda / comprar de terceiros para suprir o cliente (madeireira como intermediária).
- App / acompanhamento do pedido pelo cliente (fase 2: link/WhatsApp sem login; fase 3: portal).
- Responsável por tarefa no pátio e produtividade por funcionário.
- Login/perfil por funcionário; tela do motorista no celular.
- Fechamento de caixa diário; custo médio (em vez de último custo).
- Comprovante de entrega (foto/assinatura); rota/GPS.

---

*Próxima fase: modelagem de dados (traduzir as "peças de dados" — Produto, Movimento de estoque, Venda/Itens, Compra/Itens, Tarefa de pátio, Entrega, Lançamento financeiro, e cadastros — em entidades e relações).*
