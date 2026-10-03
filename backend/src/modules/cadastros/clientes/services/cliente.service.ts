import { Injectable } from '@nestjs/common';
import type { PaginationParams } from '../../../../common/types';
import {
  CreateClienteUseCase,
  GetClientesUseCase,
  GetClienteByIdUseCase,
  UpdateClienteUseCase,
} from '../use-cases';
import { GetClientesFilter } from '../repositories';
import { CreateClienteDto, UpdateClienteDto } from '../dto';
import { Cliente } from '../models';

@Injectable()
export class ClienteService {
  constructor(
    private readonly createUseCase: CreateClienteUseCase,
    private readonly getManyUseCase: GetClientesUseCase,
    private readonly getByIdUseCase: GetClienteByIdUseCase,
    private readonly updateUseCase: UpdateClienteUseCase,
  ) {}

  create(input: CreateClienteDto): Promise<Cliente> {
    return this.createUseCase.execute(input);
  }

  getMany(filter: GetClientesFilter, pagination: PaginationParams): Promise<Cliente[]> {
    return this.getManyUseCase.execute({ filter, pagination });
  }

  getById(id: string): Promise<Cliente> {
    return this.getByIdUseCase.execute(id);
  }

  update(id: string, data: UpdateClienteDto): Promise<Cliente> {
    return this.updateUseCase.execute({ id, data });
  }
}
