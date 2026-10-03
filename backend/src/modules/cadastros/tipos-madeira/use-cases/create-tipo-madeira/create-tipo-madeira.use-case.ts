import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectAlreadyExistsError } from '../../../../../common/errors';
import { TipoMadeiraRepository } from '../../repositories';
import { TipoMadeira } from '../../models';
import { CreateTipoMadeiraDto } from '../../dto';

@Injectable()
export class CreateTipoMadeiraUseCase implements IUseCase<CreateTipoMadeiraDto, TipoMadeira> {
  constructor(private readonly repo: TipoMadeiraRepository) {}

  async execute(input: CreateTipoMadeiraDto): Promise<TipoMadeira> {
    const existing = await this.repo.findByNome(input.nome);
    if (existing) throw new ObjectAlreadyExistsError({ objectType: 'TipoMadeira', field: 'nome' });
    return this.repo.create(input);
  }
}
