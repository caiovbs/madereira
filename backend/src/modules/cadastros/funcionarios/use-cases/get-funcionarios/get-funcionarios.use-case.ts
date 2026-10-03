import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { FuncionarioRepository, GetFuncionariosFilter } from '../../repositories';
import { Funcionario } from '../../models';

@Injectable()
export class GetFuncionariosUseCase implements IUseCase<GetFuncionariosFilter, Funcionario[]> {
  constructor(private readonly repo: FuncionarioRepository) {}

  execute(input: GetFuncionariosFilter): Promise<Funcionario[]> {
    return this.repo.getMany(input);
  }
}
