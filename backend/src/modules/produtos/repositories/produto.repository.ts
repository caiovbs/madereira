import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepositoryPrisma } from '../../../common/classes';
import { PaginationParams } from '../../../common/types';
import { getPaginationParamsToRepository } from '../../../common/utils';
import { Produto } from '../models';
import {
  CreateProdutoInput,
  GetProdutosFilter,
  ProdutoAttributesInput,
  UpdateProdutoInput,
} from './types';

@Injectable()
export class ProdutoRepository extends BaseRepositoryPrisma(Produto, 'produto') {
  async findTipo(tipoId: string) {
    return this.prismaService.tipoMadeira.findUnique({ where: { id: tipoId } });
  }

  async findByAttributes(input: ProdutoAttributesInput): Promise<Produto | null> {
    const data = await this.delegate.findFirst({ where: { ...input } });
    return data ? this.format(data) : null;
  }

  async create(input: CreateProdutoInput): Promise<Produto> {
    const data = await this.delegate.create({ data: input });
    return this.format(data);
  }

  async update(id: string, input: UpdateProdutoInput): Promise<Produto> {
    const data = await this.delegate.update({ where: { id }, data: input });
    return this.format(data);
  }

  async getMany(filter: GetProdutosFilter, pagination: PaginationParams): Promise<Produto[]> {
    const where: Prisma.ProdutoWhereInput = { ativo: true };
    if (filter.tipoId) where.tipoId = filter.tipoId;
    if (filter.estado) where.estado = filter.estado;
    if (filter.search) where.nome = { contains: filter.search, mode: 'insensitive' };

    const data = await this.delegate.findMany({
      where,
      orderBy: { nome: 'asc' },
      ...getPaginationParamsToRepository(pagination),
    });
    return this.formatMany(data);
  }

  format(obj: any): Produto {
    if (!obj) return obj;
    const custo = Number(obj.custo);
    const preco = Number(obj.preco);
    return {
      ...obj,
      espessuraCm: Number(obj.espessuraCm),
      larguraCm: Number(obj.larguraCm),
      comprimentoEstoqueM: Number(obj.comprimentoEstoqueM),
      custo,
      preco,
      margemValor: preco - custo,
      margemPct: custo > 0 ? Math.round(((preco - custo) / custo) * 100) : null,
    } as Produto;
  }
}
