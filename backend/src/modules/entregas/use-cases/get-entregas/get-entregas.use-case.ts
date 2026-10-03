import { Injectable } from '@nestjs/common';
import { IUseCase, PaginationParams } from '../../../../common/types';
import { EntregaRepository, GetEntregasFilter } from '../../repositories';
import { Entrega } from '../../models';

interface GetEntregasInput {
  filter: GetEntregasFilter;
  pagination: PaginationParams;
}

@Injectable()
export class GetEntregasUseCase implements IUseCase<GetEntregasInput, Entrega[]> {
  constructor(private readonly repo: EntregaRepository) {}

  execute({ filter, pagination }: GetEntregasInput): Promise<Entrega[]> {
    return this.repo.getMany(filter, pagination);
  }
}
