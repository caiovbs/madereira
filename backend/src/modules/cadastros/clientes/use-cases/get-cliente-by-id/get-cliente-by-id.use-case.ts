import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectNotFoundError } from '../../../../../common/errors';
import { ClienteRepository } from '../../repositories';
import { Cliente } from '../../models';

@Injectable()
export class GetClienteByIdUseCase implements IUseCase<string, Cliente> {
  constructor(private readonly repo: ClienteRepository) {}

  async execute(id: string): Promise<Cliente> {
    const cliente = await this.repo.getById(id);
    if (!cliente) throw new ObjectNotFoundError({ objectType: 'Cliente', field: 'id' });
    return cliente;
  }
}
