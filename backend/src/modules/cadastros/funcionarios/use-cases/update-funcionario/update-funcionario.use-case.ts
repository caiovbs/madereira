import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectNotFoundError } from '../../../../../common/errors';
import { FuncionarioRepository } from '../../repositories';
import { Funcionario } from '../../models';
import { UpdateFuncionarioDto } from '../../dto';

interface UpdateFuncionarioInput {
  id: string;
  data: UpdateFuncionarioDto;
}

@Injectable()
export class UpdateFuncionarioUseCase implements IUseCase<UpdateFuncionarioInput, Funcionario> {
  constructor(private readonly repo: FuncionarioRepository) {}

  async execute({ id, data }: UpdateFuncionarioInput): Promise<Funcionario> {
    const existing = await this.repo.getById(id);
    if (!existing) throw new ObjectNotFoundError({ objectType: 'Funcionario', field: 'id' });
    return this.repo.update(id, data);
  }
}
