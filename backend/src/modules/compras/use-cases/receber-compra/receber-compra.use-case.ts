import { Injectable } from '@nestjs/common';
import { CompraStatus, FormaPagamento, LancOrigem, LancSentido, LancSituacao, MovimentoOrigem, MovimentoSentido, StatusPagamentoCompra } from '@prisma/client';
import { IUseCase } from '../../../../common/types';
import { BusinessRuleError, ObjectNotFoundError } from '../../../../common/errors';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CompraRepository } from '../../repositories';
import { Compra } from '../../models';
import { ReceberCompraDto } from '../../dto';

interface ReceberCompraInput {
  id: string;
  data: ReceberCompraDto;
}

@Injectable()
export class ReceberCompraUseCase implements IUseCase<ReceberCompraInput, Compra> {
  constructor(
    private readonly compraRepository: CompraRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async execute({ id, data }: ReceberCompraInput): Promise<Compra> {
    const compra = await this.compraRepository.getById(id);
    if (!compra) throw new ObjectNotFoundError({ objectType: 'Compra', field: 'id' });
    if (compra.status !== CompraStatus.pedido) {
      throw new BusinessRuleError('Compra já foi recebida ou cancelada.');
    }
    if (data.formaPagamento === FormaPagamento.prazo && !data.vencimento) {
      throw new BusinessRuleError('Vencimento é obrigatório quando forma de pagamento é prazo.');
    }

    const situacao =
      data.formaPagamento === FormaPagamento.prazo ? LancSituacao.previsto : LancSituacao.realizado;
    const statusPagamento =
      situacao === LancSituacao.realizado
        ? StatusPagamentoCompra.pago
        : StatusPagamentoCompra.a_pagar;
    const agora = new Date();

    await this.prismaService.$transaction(async (tx) => {
      for (const item of compra.itens) {
        await tx.movimentoEstoque.create({
          data: {
            produtoId: item.produtoId,
            sentido: MovimentoSentido.entrada,
            quantidade: item.quantidade,
            origemTipo: MovimentoOrigem.compra,
            origemId: compra.id,
            custoUnit: item.custoUnit,
          },
        });
        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            qtdAtual: { increment: item.quantidade },
            custo: item.custoUnit,
          },
        });
      }

      await tx.lancamentoFinanceiro.create({
        data: {
          sentido: LancSentido.saida,
          situacao,
          origemTipo: LancOrigem.compra,
          compraId: compra.id,
          descricao: `Compra #${compra.numero}`,
          valor: compra.total,
          vencimento: data.vencimento ? new Date(data.vencimento) : null,
          dataRealizado: situacao === LancSituacao.realizado ? agora : null,
        },
      });

      await tx.compra.update({
        where: { id: compra.id },
        data: {
          status: CompraStatus.recebida,
          dataRecebida: agora,
          formaPagamento: data.formaPagamento,
          statusPagamento,
          vencimento: data.vencimento ? new Date(data.vencimento) : null,
        },
      });
    });

    return this.compraRepository.getById(compra.id) as Promise<Compra>;
  }
}
