import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { ObjectNotFoundError } from '../../../../common/errors';
import { TarefaPatioRepository } from '../../repositories';
import { TarefaPatio } from '../../models';

@Injectable()
export class GetTarefaByIdUseCase implements IUseCase<string, TarefaPatio> {
  constructor(private readonly repo: TarefaPatioRepository) {}

  async execute(id: string): Promise<TarefaPatio> {
    const tarefa = await this.repo.getById(id);
    if (!tarefa) throw new ObjectNotFoundError({ objectType: 'TarefaPatio', field: 'id' });
    return tarefa;
  }
}
