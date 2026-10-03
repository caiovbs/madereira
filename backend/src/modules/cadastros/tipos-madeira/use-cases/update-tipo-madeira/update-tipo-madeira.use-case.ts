import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectAlreadyExistsError, ObjectNotFoundError } from '../../../../../common/errors';
import { TipoMadeiraRepository } from '../../repositories';
import { TipoMadeira } from '../../models';
import { UpdateTipoMadeiraDto } from '../../dto';

interface UpdateTipoMadeiraInput {
  id: string;
  data: UpdateTipoMadeiraDto;
}

@Injectable()
export class UpdateTipoMadeiraUseCase implements IUseCase<UpdateTipoMadeiraInput, TipoMadeira> {
  constructor(private readonly repo: TipoMadeiraRepository) {}

  async execute({ id, data }: UpdateTipoMadeiraInput): Promise<TipoMadeira> {
    const existing = await this.repo.getById(id);
    if (!existing) throw new ObjectNotFoundError({ objectType: 'TipoMadeira', field: 'id' });

    if (data.nome && data.nome !== existing.nome) {
      const conflict = await this.repo.findByNome(data.nome);
      if (conflict) throw new ObjectAlreadyExistsError({ objectType: 'TipoMadeira', field: 'nome' });
    }

    return this.repo.update(id, data);
  }
}
