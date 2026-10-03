import { Injectable } from '@nestjs/common';
import { GetTarefasUseCase, GetTarefaByIdUseCase, ConcluirTarefaUseCase } from '../use-cases';
import { GetTarefasFilter } from '../repositories';
import { TarefaPatio } from '../models';

@Injectable()
export class TarefaPatioService {
  constructor(
    private readonly getManyUseCase: GetTarefasUseCase,
    private readonly getByIdUseCase: GetTarefaByIdUseCase,
    private readonly concluirUseCase: ConcluirTarefaUseCase,
  ) {}

  getMany(filter: GetTarefasFilter): Promise<TarefaPatio[]> {
    return this.getManyUseCase.execute(filter);
  }

  getById(id: string): Promise<TarefaPatio> {
    return this.getByIdUseCase.execute(id);
  }

  concluir(id: string): Promise<TarefaPatio> {
    return this.concluirUseCase.execute(id);
  }
}
