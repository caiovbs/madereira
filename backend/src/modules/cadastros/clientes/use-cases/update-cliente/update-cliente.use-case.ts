import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectNotFoundError } from '../../../../../common/errors';
import { ClienteRepository } from '../../repositories';
import { Cliente } from '../../models';
import { UpdateClienteDto } from '../../dto';

interface UpdateClienteInput {
  id: string;
  data: UpdateClienteDto;
}

@Injectable()
export class UpdateClienteUseCase implements IUseCase<UpdateClienteInput, Cliente> {
  constructor(private readonly repo: ClienteRepository) {}

  async execute({ id, data }: UpdateClienteInput): Promise<Cliente> {
    const existing = await this.repo.getById(id);
    if (!existing) throw new ObjectNotFoundError({ objectType: 'Cliente', field: 'id' });
    return this.repo.update(id, data);
  }
}
