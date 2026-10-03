import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { TarefaPatioRepository, GetTarefasFilter } from '../../repositories';
import { TarefaPatio } from '../../models';

@Injectable()
export class GetTarefasUseCase implements IUseCase<GetTarefasFilter, TarefaPatio[]> {
  constructor(private readonly repo: TarefaPatioRepository) {}

  execute(input: GetTarefasFilter): Promise<TarefaPatio[]> {
    return this.repo.getMany(input);
  }
}
