import { Injectable } from '@nestjs/common';
import { CompraStatus, Prisma } from '@prisma/client';
import { BaseRepositoryPrisma } from '../../../common/classes';
import type { PaginationParams } from '../../../common/types';
import { getPaginationParamsToRepository } from '../../../common/utils';
import { Compra } from '../models';
import type { CreateCompraDto, UpdateCompraDto } from '../dto';

export interface GetComprasFilter {
  status?: CompraStatus;
  fornecedorId?: string;
}

const INCLUDE_ITENS = { itens: true } as const;

@Injectable()
export class CompraRepository extends BaseRepositoryPrisma(Compra, 'compra') {
  async create(input: CreateCompraDto): Promise<Compra> {
    const total = input.itens.reduce(
      (sum, item) => sum + item.quantidade * item.custoUnit,
      0,
    );
    const data = await this.delegate.create({
      data: {
        fornecedorId: input.fornecedorId ?? null,
        formaPagamento: input.formaPagamento ?? null,
        vencimento: input.vencimento ? new Date(input.vencimento) : null,
        total,
        itens: {
          create: input.itens.map((item) => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            custoUnit: item.custoUnit,
            subtotalLinha: item.quantidade * item.custoUnit,
          })),
        },
      },
      include: INCLUDE_ITENS,
    });
    return this.format(data);
  }

  async update(id: string, input: UpdateCompraDto): Promise<Compra> {
    const data: Prisma.CompraUncheckedUpdateInput = {};
    if (input.fornecedorId !== undefined) data.fornecedorId = input.fornecedorId;
    if (input.formaPagamento !== undefined) data.formaPagamento = input.formaPagamento;
    if (input.vencimento !== undefined) data.vencimento = new Date(input.vencimento);

    if (input.itens !== undefined) {
      const total = input.itens.reduce(
        (sum, item) => sum + item.quantidade * item.custoUnit,
        0,
      );
      data.total = total;
      data.itens = {
        deleteMany: {},
        create: input.itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          custoUnit: item.custoUnit,
          subtotalLinha: item.quantidade * item.custoUnit,
        })),
      };
    }

    const result = await this.delegate.update({
      where: { id },
      data,
      include: INCLUDE_ITENS,
    });
    return this.format(result);
  }

  async getById(id: string): Promise<Compra | null> {
    const data = await this.delegate.findUnique({
      where: { id },
      include: INCLUDE_ITENS,
    });
    return this.format(data);
  }

  async getMany(filter: GetComprasFilter, pagination: PaginationParams): Promise<Compra[]> {
    const where: Prisma.CompraWhereInput = {};
    if (filter.status) where.status = filter.status;
    if (filter.fornecedorId) where.fornecedorId = filter.fornecedorId;
    const data = await this.delegate.findMany({
      where,
      include: INCLUDE_ITENS,
      orderBy: { numero: 'desc' },
      ...getPaginationParamsToRepository(pagination),
    });
    return this.formatMany(data);
  }

  async cancelar(id: string): Promise<Compra> {
    const data = await this.delegate.update({
      where: { id },
      data: { status: 'cancelada' },
      include: INCLUDE_ITENS,
    });
    return this.format(data);
  }

  format(obj: any): Compra {
    if (!obj) return obj;
    return {
      ...obj,
      total: Number(obj.total),
      itens: (obj.itens ?? []).map((item: any) => ({
        ...item,
        custoUnit: Number(item.custoUnit),
        subtotalLinha: Number(item.subtotalLinha),
      })),
    } as Compra;
  }
}
