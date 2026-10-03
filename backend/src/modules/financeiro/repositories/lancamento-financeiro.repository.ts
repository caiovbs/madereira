import { Injectable } from '@nestjs/common';
import { LancCategoria, LancOrigem, LancSentido, LancSituacao, Prisma } from '@prisma/client';
import { BaseRepositoryPrisma } from '../../../common/classes';
import type { PaginationParams } from '../../../common/types';
import { getPaginationParamsToRepository } from '../../../common/utils';
import { LancamentoFinanceiro } from '../models';
import type { CreateLancamentoAvulsoDto } from '../dto';

export interface GetLancamentosFilter {
  sentido?: LancSentido;
  situacao?: LancSituacao;
  origemTipo?: LancOrigem;
  categoria?: LancCategoria;
}

export interface CaixaSummary {
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
}

@Injectable()
export class LancamentoFinanceiroRepository extends BaseRepositoryPrisma(
  LancamentoFinanceiro,
  'lancamentoFinanceiro',
) {
  async createAvulso(input: CreateLancamentoAvulsoDto): Promise<LancamentoFinanceiro> {
    return this.format(
      await this.delegate.create({
        data: {
          sentido: input.sentido,
          situacao: LancSituacao.previsto,
          origemTipo: LancOrigem.avulso,
          descricao: input.descricao,
          categoria: input.categoria ?? null,
          valor: input.valor,
          vencimento: input.vencimento ? new Date(input.vencimento) : null,
        },
      }),
    );
  }

  async realizar(id: string): Promise<LancamentoFinanceiro> {
    return this.format(
      await this.delegate.update({
        where: { id },
        data: { situacao: LancSituacao.realizado, dataRealizado: new Date() },
      }),
    );
  }

  async getMany(
    filter: GetLancamentosFilter,
    pagination: PaginationParams,
  ): Promise<LancamentoFinanceiro[]> {
    const where: Prisma.LancamentoFinanceiroWhereInput = {};
    if (filter.sentido) where.sentido = filter.sentido;
    if (filter.situacao) where.situacao = filter.situacao;
    if (filter.origemTipo) where.origemTipo = filter.origemTipo;
    if (filter.categoria) where.categoria = filter.categoria;
    return this.formatMany(
      await this.delegate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...getPaginationParamsToRepository(pagination),
      }),
    );
  }

  async getCaixaSummary(): Promise<CaixaSummary> {
    const [entradas, saidas] = await Promise.all([
      this.delegate.aggregate({
        where: { situacao: LancSituacao.realizado, sentido: LancSentido.entrada },
        _sum: { valor: true },
      }),
      this.delegate.aggregate({
        where: { situacao: LancSituacao.realizado, sentido: LancSentido.saida },
        _sum: { valor: true },
      }),
    ]);
    const totalEntradas = Number(entradas._sum.valor ?? 0);
    const totalSaidas = Number(saidas._sum.valor ?? 0);
    return { totalEntradas, totalSaidas, saldo: totalEntradas - totalSaidas };
  }

  format(obj: any): LancamentoFinanceiro {
    if (!obj) return obj;
    return { ...obj, valor: Number(obj.valor) } as LancamentoFinanceiro;
  }
}
