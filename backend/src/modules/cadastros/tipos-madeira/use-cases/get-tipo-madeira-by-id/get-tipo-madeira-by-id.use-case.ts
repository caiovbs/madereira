import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectNotFoundError } from '../../../../../common/errors';
import { TipoMadeiraRepository } from '../../repositories';
import { TipoMadeira } from '../../models';

@Injectable()
export class GetTipoMadeiraByIdUseCase implements IUseCase<string, TipoMadeira> {
  constructor(private readonly repo: TipoMadeiraRepository) {}

  async execute(id: string): Promise<TipoMadeira> {
    const tipo = await this.repo.getById(id);
    if (!tipo) throw new ObjectNotFoundError({ objectType: 'TipoMadeira', field: 'id' });
    return tipo;
  }
}
