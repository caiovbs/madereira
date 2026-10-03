import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BaseRepositoryPrisma } from '../../../../common/classes';
import type { PaginationParams } from '../../../../common/types';
import { getPaginationParamsToRepository } from '../../../../common/utils';
import { Cliente } from '../models';
import type { CreateClienteDto } from '../dto';
import type { UpdateClienteDto } from '../dto';

export interface GetClientesFilter {
  search?: string;
  ativo?: boolean;
}

@Injectable()
export class ClienteRepository extends BaseRepositoryPrisma(Cliente, 'cliente') {
  async create(input: CreateClienteDto): Promise<Cliente> {
    return this.format(await this.delegate.create({ data: input }));
  }

  async update(id: string, input: UpdateClienteDto): Promise<Cliente> {
    return this.format(await this.delegate.update({ where: { id }, data: input }));
  }

  async getMany(filter: GetClientesFilter, pagination: PaginationParams): Promise<Cliente[]> {
    const where: Prisma.ClienteWhereInput = { ativo: filter.ativo ?? true };
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
