import { Injectable } from '@nestjs/common';
import {
  FormaPagamento,
  LancOrigem,
  LancSentido,
  LancSituacao,
  MovimentoOrigem,
  MovimentoSentido,
  StatusPagamentoVenda,
  TarefaTipo,
  VendaStatus,
} from '@prisma/client';
import { IUseCase } from '../../../../common/types';
import { BusinessRuleError, ObjectNotFoundError } from '../../../../common/errors';
import { PrismaService } from '../../../../prisma/prisma.service';
import { VendaRepository } from '../../repositories';
import { Venda } from '../../models';
import { FecharVendaDto } from '../../dto';

interface FecharVendaInput {
  id: string;
  data: FecharVendaDto;
}

@Injectable()
export class FecharVendaUseCase implements IUseCase<FecharVendaInput, Venda> {
  constructor(
    private readonly vendaRepository: VendaRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async execute({ id, data }: FecharVendaInput): Promise<Venda> {
    const venda = await this.vendaRepository.getById(id);
    if (!venda) throw new ObjectNotFoundError({ objectType: 'Venda', field: 'id' });
    if (venda.status !== VendaStatus.orcamento) {
      throw new BusinessRuleError('Venda já foi fechada ou cancelada.');
    }
    if (data.formaPagamento === FormaPagamento.prazo && !data.vencimento) {
      throw new BusinessRuleError('Vencimento é obrigatório quando forma de pagamento é prazo.');
    }

    // Valida estoque antes de entrar na transação
    for (const item of venda.itens) {
      const produto = await this.prismaService.produto.findUnique({
        where: { id: item.produtoId },
        select: { qtdAtual: true, nome: true },
      });
      if (!produto || produto.qtdAtual < item.quantidade) {
        throw new BusinessRuleError(
          `Estoque insuficiente para o produto ${produto?.nome ?? item.produtoId}.`,
          { produtoId: item.produtoId, disponivel: produto?.qtdAtual ?? 0, solicitado: item.quantidade },
        );
      }
    }

    const situacao =
      data.formaPagamento === FormaPagamento.prazo ? LancSituacao.previsto : LancSituacao.realizado;
    const statusPagamento =
      situacao === LancSituacao.realizado ? StatusPagamentoVenda.pago : StatusPagamentoVenda.a_receber;
    const agora = new Date();

    await this.prismaService.$transaction(async (tx) => {
      // 1. Baixa de estoque
      for (const item of venda.itens) {
        await tx.movimentoEstoque.create({
          data: {
            produtoId: item.produtoId,
            sentido: MovimentoSentido.baixa,
            quantidade: item.quantidade,
            origemTipo: MovimentoOrigem.venda,
            origemId: venda.id,
          },
        });
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { qtdAtual: { decrement: item.quantidade } },
        });
      }

      // 2. Tarefa separar (sempre, uma por venda)
      await tx.tarefaPatio.create({
        data: { vendaId: venda.id, tipo: TarefaTipo.separar },
      });

      // 3. Tarefas preparar (por item que precisa de corte ou aparelho)
      for (const item of venda.itens) {
        if (item.cortarParaM != null || item.aparelhar) {
          await tx.tarefaPatio.create({
            data: { vendaId: venda.id, itemVendaId: item.id, tipo: TarefaTipo.preparar },
          });
        }
      }

      // 4. Entrega
      await tx.entrega.create({
        data: { vendaId: venda.id },
      });

      // 5. Lançamento financeiro
      await tx.lancamentoFinanceiro.create({
        data: {
          sentido: LancSentido.entrada,
          situacao,
          origemTipo: LancOrigem.venda,
          vendaId: venda.id,
          descricao: `Venda #${venda.numero}`,
          valor: venda.total,
          vencimento: data.vencimento ? new Date(data.vencimento) : null,
          dataRealizado: situacao === LancSituacao.realizado ? agora : null,
        },
      });

      // 6. Fecha a venda
      await tx.venda.update({
        where: { id: venda.id },
        data: {
          status: VendaStatus.fechada,
          dataVenda: agora,
          formaPagamento: data.formaPagamento,
          statusPagamento,
        },
      });
    });

    return this.vendaRepository.getById(venda.id) as Promise<Venda>;
  }
}
