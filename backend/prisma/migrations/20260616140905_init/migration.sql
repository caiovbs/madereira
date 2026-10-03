-- CreateEnum
CREATE TYPE "EstadoMadeira" AS ENUM ('bruta', 'aparelhada');

-- CreateEnum
CREATE TYPE "Funcao" AS ENUM ('aparelhador', 'cortador', 'carregador', 'motorista');

-- CreateEnum
CREATE TYPE "MovimentoSentido" AS ENUM ('entrada', 'baixa');

-- CreateEnum
CREATE TYPE "MovimentoOrigem" AS ENUM ('venda', 'compra', 'ajuste');

-- CreateEnum
CREATE TYPE "VendaStatus" AS ENUM ('orcamento', 'fechada', 'cancelada');

-- CreateEnum
CREATE TYPE "TipoEntrega" AS ENUM ('retirada', 'entrega');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('dinheiro', 'pix', 'cartao', 'prazo');

-- CreateEnum
CREATE TYPE "StatusPagamentoVenda" AS ENUM ('pago', 'a_receber');

-- CreateEnum
CREATE TYPE "StatusPagamentoCompra" AS ENUM ('pago', 'a_pagar');

-- CreateEnum
CREATE TYPE "CompraStatus" AS ENUM ('pedido', 'recebida', 'cancelada');

-- CreateEnum
CREATE TYPE "TarefaTipo" AS ENUM ('preparar', 'separar');

-- CreateEnum
CREATE TYPE "TarefaStatus" AS ENUM ('pendente', 'concluida');

-- CreateEnum
CREATE TYPE "EntregaStatus" AS ENUM ('a_carregar', 'carregado', 'em_rota', 'entregue', 'cancelada');

-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('manha', 'tarde');

-- CreateEnum
CREATE TYPE "LancSentido" AS ENUM ('entrada', 'saida');

-- CreateEnum
CREATE TYPE "LancSituacao" AS ENUM ('previsto', 'realizado');

-- CreateEnum
CREATE TYPE "LancOrigem" AS ENUM ('venda', 'compra', 'avulso');

-- CreateEnum
CREATE TYPE "LancCategoria" AS ENUM ('combustivel', 'salario', 'energia', 'manutencao', 'outro');

-- CreateTable
CREATE TABLE "tipo_madeira" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_madeira_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produto" (
    "id" UUID NOT NULL,
    "tipoId" UUID NOT NULL,
    "estado" "EstadoMadeira" NOT NULL,
    "espessuraCm" DECIMAL(6,2) NOT NULL,
    "larguraCm" DECIMAL(6,2) NOT NULL,
    "comprimentoEstoqueM" DECIMAL(6,2) NOT NULL,
    "nome" TEXT NOT NULL,
    "custo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "preco" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estoqueMinimo" INTEGER NOT NULL DEFAULT 0,
    "qtdAtual" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimento_estoque" (
    "id" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "sentido" "MovimentoSentido" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "origemTipo" "MovimentoOrigem" NOT NULL,
    "origemId" UUID,
    "custoUnit" DECIMAL(12,2),
    "observacao" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimento_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "endereco" TEXT,
    "documento" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedor" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "observacao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fornecedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionario" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "funcoes" "Funcao"[],
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funcionario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caminhao" (
    "id" UUID NOT NULL,
    "descricao" TEXT NOT NULL,
    "placa" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caminhao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda" (
    "id" UUID NOT NULL,
    "numero" SERIAL NOT NULL,
    "clienteId" UUID,
    "obraRef" TEXT,
    "status" "VendaStatus" NOT NULL DEFAULT 'orcamento',
    "tipoEntrega" "TipoEntrega" NOT NULL DEFAULT 'retirada',
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "frete" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "desconto" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "formaPagamento" "FormaPagamento",
    "statusPagamento" "StatusPagamentoVenda",
    "dataVenda" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_venda" (
    "id" UUID NOT NULL,
    "vendaId" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnit" DECIMAL(12,2) NOT NULL,
    "cortarParaM" DECIMAL(6,2),
    "aparelhar" BOOLEAN NOT NULL DEFAULT false,
    "subtotalLinha" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "item_venda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compra" (
    "id" UUID NOT NULL,
    "numero" SERIAL NOT NULL,
    "fornecedorId" UUID,
    "status" "CompraStatus" NOT NULL DEFAULT 'pedido',
    "total" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "statusPagamento" "StatusPagamentoCompra",
    "formaPagamento" "FormaPagamento",
    "vencimento" DATE,
    "dataPedido" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataRecebida" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_compra" (
    "id" UUID NOT NULL,
    "compraId" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "custoUnit" DECIMAL(12,2) NOT NULL,
    "subtotalLinha" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "item_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefa_patio" (
    "id" UUID NOT NULL,
    "vendaId" UUID NOT NULL,
    "itemVendaId" UUID,
    "tipo" "TarefaTipo" NOT NULL,
    "status" "TarefaStatus" NOT NULL DEFAULT 'pendente',
    "corteConcluido" BOOLEAN NOT NULL DEFAULT false,
    "aparelhoConcluido" BOOLEAN NOT NULL DEFAULT false,
    "concluidaEm" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarefa_patio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrega" (
    "id" UUID NOT NULL,
    "vendaId" UUID NOT NULL,
    "status" "EntregaStatus" NOT NULL DEFAULT 'a_carregar',
    "caminhaoId" UUID,
    "motoristaId" UUID,
    "endereco" TEXT,
    "observacao" TEXT,
    "dataAgendada" DATE,
    "turno" "Turno",
    "carregadoEm" TIMESTAMPTZ(6),
    "saiuEm" TIMESTAMPTZ(6),
    "entregueEm" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entrega_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamento_financeiro" (
    "id" UUID NOT NULL,
    "sentido" "LancSentido" NOT NULL,
    "situacao" "LancSituacao" NOT NULL,
    "origemTipo" "LancOrigem" NOT NULL,
    "vendaId" UUID,
    "compraId" UUID,
    "descricao" TEXT NOT NULL,
    "categoria" "LancCategoria",
    "valor" DECIMAL(12,2) NOT NULL,
    "vencimento" DATE,
    "dataRealizado" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lancamento_financeiro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipo_madeira_nome_key" ON "tipo_madeira"("nome");

-- CreateIndex
CREATE INDEX "produto_nome_idx" ON "produto"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "produto_tipoId_estado_espessuraCm_larguraCm_comprimentoEsto_key" ON "produto"("tipoId", "estado", "espessuraCm", "larguraCm", "comprimentoEstoqueM");

-- CreateIndex
CREATE INDEX "movimento_estoque_produtoId_idx" ON "movimento_estoque"("produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "venda_numero_key" ON "venda"("numero");

-- CreateIndex
CREATE INDEX "item_venda_vendaId_idx" ON "item_venda"("vendaId");

-- CreateIndex
CREATE UNIQUE INDEX "compra_numero_key" ON "compra"("numero");

-- CreateIndex
CREATE INDEX "item_compra_compraId_idx" ON "item_compra"("compraId");

-- CreateIndex
CREATE INDEX "tarefa_patio_vendaId_idx" ON "tarefa_patio"("vendaId");

-- CreateIndex
CREATE UNIQUE INDEX "entrega_vendaId_key" ON "entrega"("vendaId");

-- CreateIndex
CREATE INDEX "lancamento_financeiro_situacao_idx" ON "lancamento_financeiro"("situacao");

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "tipo_madeira"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimento_estoque" ADD CONSTRAINT "movimento_estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda" ADD CONSTRAINT "venda_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_venda" ADD CONSTRAINT "item_venda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_venda" ADD CONSTRAINT "item_venda_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra" ADD CONSTRAINT "compra_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_compra" ADD CONSTRAINT "item_compra_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_compra" ADD CONSTRAINT "item_compra_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_patio" ADD CONSTRAINT "tarefa_patio_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefa_patio" ADD CONSTRAINT "tarefa_patio_itemVendaId_fkey" FOREIGN KEY ("itemVendaId") REFERENCES "item_venda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "venda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_caminhaoId_fkey" FOREIGN KEY ("caminhaoId") REFERENCES "caminhao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "funcionario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento_financeiro" ADD CONSTRAINT "lancamento_financeiro_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento_financeiro" ADD CONSTRAINT "lancamento_financeiro_compraId_fkey" FOREIGN KEY ("compraId") REFERENCES "compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
