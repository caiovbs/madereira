import { Injectable } from '@nestjs/common';
import { IUseCase, PaginationParams } from '../../../../common/types';
import { VendaRepository, GetVendasFilter } from '../../repositories';
import { Venda } from '../../models';

interface GetVendasInput {
  filter: GetVendasFilter;
  pagination: PaginationParams;
}

@Injectable()
export class GetVendasUseCase implements IUseCase<GetVendasInput, Venda[]> {
  constructor(private readonly vendaRepository: VendaRepository) {}

  execute({ filter, pagination }: GetVendasInput): Promise<Venda[]> {
    return this.vendaRepository.getMany(filter, pagination);
  }
}
