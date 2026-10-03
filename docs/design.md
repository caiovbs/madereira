# Design — Telas e Navegação

> **Fase:** design (UX). Base: [requisitos-funcionais.md](requisitos-funcionais.md), [modelo-de-dados.md](modelo-de-dados.md), [requisitos-nao-funcionais.md](requisitos-nao-funcionais.md).
> **Contexto:** app **web (React)** para **PC**, **1 usuário**, rodando local no MVP.

---

## 1. Navegação geral (o shell)

Padrão de app web de gestão: **menu lateral fixo + barra superior + área de conteúdo**.

```
┌─────────────────────────────────────────────────────────────────────┐
│  🪵 Madeireira     🔍 buscar produto/cliente...     [ + Nova venda ] ◯│
├──────────────┬──────────────────────────────────────────────────────┤
│  🏠 Início    │                                                       │
│  🧾 Vendas    │                                                       │
│  📦 Estoque   │               ÁREA DE CONTEÚDO                        │
│  🛒 Compras   │            (a tela do módulo ativo)                   │
│  🪚 Pátio     │                                                       │
│  🚚 Entregas  │                                                       │
│  💰 Financeiro│                                                       │
│  ───────────  │                                                       │
│  ⚙ Cadastros ▾│  Clientes · Fornecedores · Funcionários · Caminhões   │
└──────────────┴──────────────────────────────────────────────────────┘
```

### Princípios
- **Ordem do menu = fluxo do dia** (não alfabética): Início → Vendas (mais usada) → Estoque → Compras → Pátio → Entregas → Financeiro → Cadastros (submenu, no rodapé).
- **Atalhos fixos no topo:** `+ Nova venda` (ação nº 1) e **busca global** (produto/cliente).
- **Navegação cruzada:** registros relacionados se linkam. De uma Venda → ver Entrega, tarefas do Pátio, lançamento no Financeiro. Nunca ficar "preso" num módulo.

### Tela "Início" (painel de pulso)
Landing com a situação num olhar; cada cartão é clicável e leva ao módulo (já filtrado quando fizer sentido):
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Saldo caixa │ A receber   │ A pagar     │ Estoque ⚠   │
└─────────────┴─────────────┴─────────────┴─────────────┘
 Entregas de hoje            │ Pátio — tarefas pendentes
```

---

---

## 2. Vendas

### 2.1 Lista de Vendas
```
VENDAS                  [ Status ▾ ] [ Período ▾ ]  🔍      [ + Nova venda ]
 Nº    Cliente        Data   Total      Pagamento   Status
 #142  João Silva     16/06  2.924,00   A receber   🟢 Fechada
 #140  Construtora Y  15/06  5.100,00   —           ⚪ Orçamento
```
- Linha clicável: Orçamento abre em edição; Fechada abre em leitura.
- Filtros: status, período; busca por cliente/número.

### 2.2 Editor de Venda
**Abre como tela dedicada** (full-page focada, com botão "← Voltar") ao clicar em "+ Nova venda" — não como modal (venda é rica e cresce com itens; padrão de apps de nota/venda). Layout de nota/pedido: **itens à esquerda (área grande) + painel resumo/checkout fixo à direita**.
```
┌─ Venda #142 ───────────────────────── ⚪ Orçamento ──────────────┐
│ Cliente [▾][+]   Obra/ref [ ]   Data                             │
├────────────────────────────────────────────┬────────────────────┤
│ ➕ [🔍 buscar produto] Qtd [ ] [Add]        │ RESUMO             │
│ Produto      Qtd Unit Prep Subtotal  ⋮      │ Subtotal           │
│  └ cortar X · aparelhar                      │ Frete    [ ]       │
│                                              │ Desconto [ ]       │
│                                              │ TOTAL              │
│                                              │ ENTREGA (•)Entregar│
│                                              │  ( )Retirada       │
│                                              │  End/Caminhão/Mot/ │
│                                              │  Data/Turno        │
│                                              │ PAGAMENTO Forma[▾] │
│                                              │  (•)Pago ( )A receb│
│                                              │ [Salvar orçamento] │
│                                              │ [✓ Fechar venda]   │
└──────────────────────────────────────────────┴────────────────────┘
```

### Decisões de UX
1. **Autocomplete de produto mostra saldo + preço** ("Pinus 5×30 · 120 pç · R$38") — disponibilidade visível ao adicionar.
2. **Preparo por linha em popover (`⋮`):** cortar para [medida] + aparelhar [✓]; resumo exibido sob o produto. Não polui a tabela.
3. **Aviso de estoque inline** (célula Qtd acende ⚠) + **bloqueio na confirmação** do Fechar venda (RF-V10), nomeando os itens. Orçamento salva sem trava (RF-V9).
4. **Confirmação ao Fechar venda** (dispara a cascata RF-X1) com resumo, para evitar fechamento acidental.
5. **Venda fechada = somente leitura** + atalhos cruzados: [Ver entrega] [Ver pátio] [Ver no financeiro].
6. **Orçamento = rascunho retomável.** "Salvar orçamento" grava parcial sem validar/baixar (RF-V9); aparece na lista como ⚪ Orçamento e pode ser reaberto para continuar. Atende o caso real "cliente manda o pedido em partes" (pode ter vários orçamentos abertos, um por cliente). Não é v2 — já está no design.
7. **Nova venda abre em tela dedicada** (não modal), com "← Voltar".

---

---

## 3. Estoque

### 3.1 Lista de Estoque
```
ESTOQUE   [Tipo ▾][Estado ▾][☐ só baixo]  🔍 buscar      [+ Novo produto]
 Produto                     Qtd   Mín  Custo  Preço  Margem        [+entr]
 Pinus Aparelhada 5×30 3,0m  120   30   24,00  38,00  +14 (58%)
 Eucalipto Bruta 6×6 3,0m  ⚠ 18    40   16,00  22,00  +6 (38%)
```
- Nome já traz tipo+estado+medida; tipo/estado ficam nos filtros. Margem pronta (coluna calculada). `⚠` = Qtd ≤ Mín. `[+entr]` = entrada rápida.

### 3.2 Ficha do Produto (drawer lateral)
```
Tipo[▾] Estado[▾]  Espessura[ ] Largura[ ] Comp[ ]m
  ➜ "Pinus Bruta 5×30 3,00m"   ✓ disponível / ⚠ já existe
Custo[ ]  Preço[ ]   Margem: R$ x (y%)
Estoque mínimo[ ]    Estoque atual: N (só leitura → ver movimentos)
[✓ Ativo]            [Cancelar][Salvar]
```
- **Nome gerado ao vivo**; usuário não digita.
- **Detecção de duplicata** (chave única) → bloqueia Salvar.
- **Margem ao vivo** (R$ e %).
- **Estoque atual só leitura** + link "ver movimentos".

### 3.3 Entrada rápida (modal)
```
[produto] Quantidade[ ]pç  Fornecedor[▾](opc)  Custo/pç[ ](opc)  [Confirmar]
```
- Soma estoque e cria por baixo uma **Compra "recebida"** (RF-E6) → deixa rastro.

### 3.4 Movimentos do produto (extrato)
```
Data  Movimento  Qtd   Origem      Saldo após
16/06 baixa      −70   Venda #142   120
14/06 entrada   +100   Compra #36   190
```
- Responde "cadê as peças?" — cada linha aponta a venda/compra de origem.

---

---

## 4. Compras (espelho da Venda)

### 4.1 Lista de Compras
```
COMPRAS               [Status ▾][Período ▾] 🔍        [+ Nova compra]
⚠ REPOSIÇÃO SUGERIDA
 Eucalipto Bruta 6×6 3,0m  tem 18 · mín 40  sugerido +22  [+ pedido]
HISTÓRICO
 Nº  Fornecedor          Data   Total      Pagamento  Status
 #36 Serraria São José   16/06  2.360,00   A pagar    🟢 Recebida
 #35 Madeireira Central  14/06  1.800,00   —          ⏳ Pedido
```
- Reposição sugerida puxa do `estoque_mínimo` e **sugere quantidade** (+N para voltar ao mínimo); `[+ pedido]` joga o item num rascunho de compra.

### 4.2 Editor de Compra
Mesma cara do editor de Venda. Painel direito: TOTAL + PAGAMENTO (À vista / A prazo + vencimento) + [Salvar pedido] / [✓ Marcar recebida].

| Venda | Compra |
|---|---|
| coluna Preço | coluna **Custo** (editável até receber) |
| Frete/Desconto/Entrega | não tem |
| cortar/aparelhar na linha | não tem |
| Pagamento Pago/A receber | À vista / A prazo (+ vencimento) |
| Fechar venda → baixa | **Marcar recebida** → entrada |

### Decisões de UX
1. **Custo editável por linha até receber** — ajusta pro valor real da nota; vira o "último custo" do produto.
2. **Confirmação ao Marcar recebida** mostra a cascata (entrada no estoque + custo atualizado + lançamento "A pagar" com vencimento).
3. **Pedido (⏳) é editável**; **Recebida (🟢) vira leitura** (estoque/financeiro já moveram).
4. **Recebimento de carga em lote:** uma carreta = **uma Compra com várias linhas** (uma por medida); "Marcar recebida" dá entrada em tudo de uma vez. A Compra É o lote — rastreável via origem do MovimentoEstoque. Unidade confirmada = **peça por medida** (m³ segue v2; não é necessário para receber carga).
5. **"+ criar produto na hora"** na busca da compra (medida nova que chega na carga, cadastra inline) + **entrada rápida em sequência** (foco volta à busca) para descarregar a carreta linha após linha.

---

---

## 5. Pátio (fila de tarefas)

```
PÁTIO — TAREFAS     [Pendentes ▾][Tipo ▾]  🔍
 ✂🪚 PREPARAR · Venda #142 · João          ⏳ pendente
    70 pç · Pinus Bruta 5×30 3,0m
    ☐ cortar para 2,50m   ☐ aparelhar          [✓ Concluir]
 📦 SEPARAR · Venda #145 · Construtora Y (retirada) ⏳   [✓ Concluir]
 ✅ PREPARAR · Venda #138 · Maria            concluída
```

### Decisões de UX
1. **Checklist controla a conclusão** — marca cortar/aparelhar; quando os passos aplicáveis estão ✓, fecha. Estado parcial visível ("cortado · falta aparelhar").
2. **Separar = ação única** (sem checklist).
3. **Cartão aponta/linka pra venda**; instrução vem do ItemVenda, cartão só rastreia progresso.
4. **Trava visível:** concluir a última tarefa da venda → aviso "Entrega liberada"; enquanto pendente, a entrega mostra "⏳ aguardando pátio". Trava no nível da venda.
5. **Filtro "Pendentes" padrão**; concluídas recolhidas.
6. MVP: escritório marca no PC; tela responsiva serve um tablet no galpão depois.

---

---

## 6. Entregas

### 6.1 Painel (quadro por status / kanban)
```
ENTREGAS   [Hoje ▾][Motorista ▾]  🔍
 A CARREGAR        | CARREGADO   | EM ROTA      | ENTREGUE
 #142 João         | #150 Pedro  | #138 Maria   | #131 ✓14:20
 📍Rua X,100 🕗manhã| Caminhão A·Zé| Caminhão A·Zé|
 Caminhão[▾]Mot[▾] | [→ Em rota] | [→ Entregue] |
 [→ Carregado]     |             |              |
 #145 ⏳aguard.pátio (botão off)  |              |
```
Avança por botão `→` (sem drag).

### 6.2 Detalhe (drawer)
Cliente+telefone · endereço da obra (snapshot editável) · obs · itens · Caminhão[▾] · Motorista[▾] (só função motorista) · Agendamento data/turno · botão de status · linha do tempo.

### Decisões de UX
1. **Quadro = pipeline visível**; cada cartão avança por botão.
2. **Trava do pátio no cartão:** `⏳ aguardando pátio` com `[→ Carregado]` desabilitado até liberar.
3. **Caminhão/motorista** atribuídos no cartão/detalhe; seletor de motorista filtra `função = motorista`.
4. **Endereço = obra** (snapshot editável).
5. **Carimbos automáticos** (carregado_em/saiu_em/entregue_em) → linha do tempo.
6. **Retirada não aparece** (fica no Pátio como "separar").
7. MVP: escritório avança os status (sem app do motorista).

---

---

## 7. Financeiro (abas)

`[ Visão geral | A receber | A pagar | Caixa ]   [+ Lançamento]   [período ▾]`

### Visão geral
3 cartões (Saldo do caixa · A receber · A pagar, com contadores de vencidas) + movimentação do dia.

### A receber / A pagar
Listas com vencimento; vencidos em vermelho no topo; ação `[✓ Recebi]` / `[✓ Paguei]`.
```
Venda #142 · João   R$ 2.804  vence 20/06   [✓ Recebi]
Venda #131 · Y      R$ 1.900  venceu 10/06 ⚠ [✓ Recebi]
```

### Caixa (extrato)
```
Data  Descrição           Entrada  Saída   Saldo
16/06 Venda #142 (Pix)    2.804            8.450
16/06 Combustível                  180     5.646
01/06 Saldo inicial       3.000            3.000
```

### Lançamento manual (modal)
Tipo (Entrada/Saída) · Descrição · Categoria · Valor · Quando (já pago=caixa / a vencer=previsto + vencimento).

### Decisões de UX
1. **`✓ Recebi/Paguei` = um clique** → vira a chave previsto→realizado (model A); sai da lista, entra no Caixa.
2. **Vencidos em vermelho/topo**; alimentam contadores da visão geral.
3. **Lançamento manual** cobre despesa já paga (caixa) ou a vencer (a pagar) — torna o caixa real.
4. **Lançamentos de venda/compra** são baixados aqui mas editados na origem; só **avulsos** editáveis no Financeiro.
5. **Saldo inicial** = lançamento avulso de entrada.
6. v2: pagamento parcial (aqui é integral) e múltiplas contas (hoje, caixa único).

---

---

## 8. Cadastros (padrão comum)

Quatro cadastros, mesmo template: **lista (busca + ver inativos + Novo) + ficha em drawer**. `🚫` desativa (soft delete) em vez de apagar.

| Cadastro | Campos | Detalhe |
|---|---|---|
| Clientes | nome*, telefone, endereço, documento | só nome obrigatório |
| Fornecedores | nome*, telefone, observação | enxuto |
| Funcionários | nome*, **funções (chips multi)**, telefone | funções múltiplas |
| Caminhões | descrição*, placa | — |

### Funcionário — funções como chips
```
Nome[ ]  Funções: [Cortador ✕][Motorista ✕] +  Telefone[ ]  [✓ Ativo]
```
Multi-seleção → o mesmo funcionário aparece no seletor de motorista e pode ser cortador.

### Conexão
Desativar um cadastro **não afeta** vendas/entregas antigas (guardam o vínculo); só remove o registro das escolhas novas.

---

## ✅ Design do MVP — completo
Navegação + 7 módulos (Vendas, Estoque, Compras, Pátio, Entregas, Financeiro, Cadastros) com layouts web e decisões de UX. Próxima fase do processo: **arquitetura/código**.
