import { Injectable } from '@nestjs/common';
import { IUseCase, PaginationParams } from '../../../../common/types';
import { CompraRepository, GetComprasFilter } from '../../repositories';
import { Compra } from '../../models';

interface GetComprasInput {
  filter: GetComprasFilter;
  pagination: PaginationParams;
}

@Injectable()
export class GetComprasUseCase implements IUseCase<GetComprasInput, Compra[]> {
  constructor(private readonly compraRepository: CompraRepository) {}

  execute({ filter, pagination }: GetComprasInput): Promise<Compra[]> {
    return this.compraRepository.getMany(filter, pagination);
  }
}
