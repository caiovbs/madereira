import { Injectable } from '@nestjs/common';
import { TarefaStatus } from '@prisma/client';
import { IUseCase } from '../../../../common/types';
import { BusinessRuleError, ObjectNotFoundError } from '../../../../common/errors';
import { TarefaPatioRepository } from '../../repositories';
import { TarefaPatio } from '../../models';

@Injectable()
export class ConcluirTarefaUseCase implements IUseCase<string, TarefaPatio> {
  constructor(private readonly repo: TarefaPatioRepository) {}

  async execute(id: string): Promise<TarefaPatio> {
    const tarefa = await this.repo.getById(id);
    if (!tarefa) throw new ObjectNotFoundError({ objectType: 'TarefaPatio', field: 'id' });
    if (tarefa.status === TarefaStatus.concluida) {
      throw new BusinessRuleError('Tarefa já está concluída.');
    }
    return this.repo.concluir(id);
  }
}
