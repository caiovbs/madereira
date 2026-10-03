import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepositoryPrisma } from '../../../../common/classes';
import type { PaginationParams } from '../../../../common/types';
import { getPaginationParamsToRepository } from '../../../../common/utils';
import { Fornecedor } from '../models';
import type { CreateFornecedorDto } from '../dto';
import type { UpdateFornecedorDto } from '../dto';

export interface GetFornecedoresFilter {
  search?: string;
  ativo?: boolean;
}

@Injectable()
export class FornecedorRepository extends BaseRepositoryPrisma(Fornecedor, 'fornecedor') {
  async create(input: CreateFornecedorDto): Promise<Fornecedor> {
    return this.format(await this.delegate.create({ data: input }));
  }

  async update(id: string, input: UpdateFornecedorDto): Promise<Fornecedor> {
    return this.format(await this.delegate.update({ where: { id }, data: input }));
  }

  async getMany(filter: GetFornecedoresFilter, pagination: PaginationParams): Promise<Fornecedor[]> {
    const where: Prisma.FornecedorWhereInput = { ativo: filter.ativo ?? true };
    if (filter.search) where.nome = { contains: filter.search, mode: 'insensitive' };
    return this.formatMany(
      await this.delegate.findMany({
        where,
        orderBy: { nome: 'asc' },
        ...getPaginationParamsToRepository(pagination),
      }),
    );
  }
}
