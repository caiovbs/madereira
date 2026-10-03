import { Injectable } from '@nestjs/common';
import { Funcao } from '@prisma/client';
import { BaseRepositoryPrisma } from '../../../../common/classes';
import { Funcionario } from '../models';
import type { CreateFuncionarioDto } from '../dto';
import type { UpdateFuncionarioDto } from '../dto';

export interface GetFuncionariosFilter {
  search?: string;
  funcao?: Funcao;
  ativo?: boolean;
}

@Injectable()
export class FuncionarioRepository extends BaseRepositoryPrisma(Funcionario, 'funcionario') {
  async create(input: CreateFuncionarioDto): Promise<Funcionario> {
    return this.format(await this.delegate.create({ data: input }));
  }

  async update(id: string, input: UpdateFuncionarioDto): Promise<Funcionario> {
    return this.format(await this.delegate.update({ where: { id }, data: input }));
  }

  async getMany(filter: GetFuncionariosFilter): Promise<Funcionario[]> {
    const where: any = {};
    if (filter.ativo !== undefined) where.ativo = filter.ativo;
    if (filter.funcao) where.funcoes = { has: filter.funcao };
    if (filter.search) where.nome = { contains: filter.search, mode: 'insensitive' };
    return this.formatMany(
      await this.delegate.findMany({ where, orderBy: { nome: 'asc' } }),
    );
  }
}
