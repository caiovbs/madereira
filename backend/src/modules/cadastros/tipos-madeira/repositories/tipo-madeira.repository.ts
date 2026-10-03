import { Injectable } from '@nestjs/common';
import { BaseRepositoryPrisma } from '../../../../common/classes';
import { TipoMadeira } from '../models';

export interface GetTiposMadeiraFilter {
  search?: string;
  ativo?: boolean;
}

@Injectable()
export class TipoMadeiraRepository extends BaseRepositoryPrisma(TipoMadeira, 'tipoMadeira') {
  async findByNome(nome: string): Promise<TipoMadeira | null> {
    return this.format(await this.delegate.findUnique({ where: { nome } }));
  }

  async create(input: { nome: string }): Promise<TipoMadeira> {
    return this.format(await this.delegate.create({ data: input }));
  }

  async update(id: string, input: { nome?: string; ativo?: boolean }): Promise<TipoMadeira> {
    return this.format(await this.delegate.update({ where: { id }, data: input }));
  }

  async getMany(filter: GetTiposMadeiraFilter): Promise<TipoMadeira[]> {
    const where: any = {};
    if (filter.ativo !== undefined) where.ativo = filter.ativo;
    if (filter.search) where.nome = { contains: filter.search, mode: 'insensitive' };
    return this.formatMany(
      await this.delegate.findMany({ where, orderBy: { nome: 'asc' } }),
    );
  }
}
