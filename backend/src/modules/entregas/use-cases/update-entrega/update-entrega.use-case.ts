import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { ObjectNotFoundError } from '../../../../common/errors';
import { EntregaRepository } from '../../repositories';
import { Entrega } from '../../models';
import { UpdateEntregaDto } from '../../dto';

interface UpdateEntregaInput {
  id: string;
  data: UpdateEntregaDto;
}

@Injectable()
export class UpdateEntregaUseCase implements IUseCase<UpdateEntregaInput, Entrega> {
  constructor(private readonly repo: EntregaRepository) {}

  async execute({ id, data }: UpdateEntregaInput): Promise<Entrega> {
    const entrega = await this.repo.getById(id);
    if (!entrega) throw new ObjectNotFoundError({ objectType: 'Entrega', field: 'id' });
    return this.repo.update(id, data);
  }
}
