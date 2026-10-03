import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { ObjectNotFoundError } from '../../../../common/errors';
import { EntregaRepository } from '../../repositories';
import { Entrega } from '../../models';

@Injectable()
export class GetEntregaByIdUseCase implements IUseCase<string, Entrega> {
  constructor(private readonly repo: EntregaRepository) {}

  async execute(id: string): Promise<Entrega> {
    const entrega = await this.repo.getById(id);
    if (!entrega) throw new ObjectNotFoundError({ objectType: 'Entrega', field: 'id' });
    return entrega;
  }
}
