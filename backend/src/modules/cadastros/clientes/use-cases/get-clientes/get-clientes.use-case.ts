import { Injectable } from '@nestjs/common';
import { IUseCase, PaginationParams } from '../../../../../common/types';
import { ClienteRepository, GetClientesFilter } from '../../repositories';
import { Cliente } from '../../models';

interface GetClientesInput {
  filter: GetClientesFilter;
  pagination: PaginationParams;
}

@Injectable()
export class GetClientesUseCase implements IUseCase<GetClientesInput, Cliente[]> {
  constructor(private readonly repo: ClienteRepository) {}

  execute({ filter, pagination }: GetClientesInput): Promise<Cliente[]> {
    return this.repo.getMany(filter, pagination);
  }
}
