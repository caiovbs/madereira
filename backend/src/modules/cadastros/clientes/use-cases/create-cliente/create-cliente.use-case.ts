import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ClienteRepository } from '../../repositories';
import { Cliente } from '../../models';
import { CreateClienteDto } from '../../dto';

@Injectable()
export class CreateClienteUseCase implements IUseCase<CreateClienteDto, Cliente> {
  constructor(private readonly repo: ClienteRepository) {}

  execute(input: CreateClienteDto): Promise<Cliente> {
    return this.repo.create(input);
  }
}
