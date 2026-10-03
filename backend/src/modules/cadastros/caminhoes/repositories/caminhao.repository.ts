import { Injectable } from '@nestjs/common';
import { BaseRepositoryPrisma } from '../../../../common/classes';
import { Caminhao } from '../models';
import type { CreateCaminhaoDto } from '../dto';
import type { UpdateCaminhaoDto } from '../dto';

export interface GetCaminhoesFilter {
  search?: string;
  ativo?: boolean;
}

@Injectable()
export class CaminhaoRepository extends BaseRepositoryPrisma(
  Caminhao,
  'caminhao',
) {
  async create(input: CreateCaminhaoDto): Promise<Caminhao> {
    return this.format(await this.delegate.create({ data: input }));
  }

  async update(id: string, input: UpdateCaminhaoDto): Promise<Caminhao> {
    return this.format(
      await this.delegate.update({ where: { id }, data: input }),
    );
  }

  async getMany(filter: GetCaminhoesFilter): Promise<Caminhao[]> {
    const where: any = {};
    if (filter.ativo !== undefined) where.ativo = filter.ativo;
    if (filter.search)
      where.descricao = { contains: filter.search, mode: 'insensitive' };
    return this.formatMany(
      await this.delegate.findMany({ where, orderBy: { descricao: 'asc' } }),
    );
  }
}
