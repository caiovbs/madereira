import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { FuncionarioRepository } from '../../repositories';
import { Funcionario } from '../../models';
import { CreateFuncionarioDto } from '../../dto';

@Injectable()
export class CreateFuncionarioUseCase implements IUseCase<CreateFuncionarioDto, Funcionario> {
  constructor(private readonly repo: FuncionarioRepository) {}

  execute(input: CreateFuncionarioDto): Promise<Funcionario> {
    return this.repo.create(input);
  }
}
