import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectNotFoundError } from '../../../../../common/errors';
import { FuncionarioRepository } from '../../repositories';
import { Funcionario } from '../../models';

@Injectable()
export class GetFuncionarioByIdUseCase implements IUseCase<string, Funcionario> {
  constructor(private readonly repo: FuncionarioRepository) {}

  async execute(id: string): Promise<Funcionario> {
    const funcionario = await this.repo.getById(id);
    if (!funcionario) throw new ObjectNotFoundError({ objectType: 'Funcionario', field: 'id' });
    return funcionario;
  }
}
