import { Injectable } from '@nestjs/common';
import { IUseCase, PaginationParams } from '../../../../../common/types';
import { FornecedorRepository, GetFornecedoresFilter } from '../../repositories';
import { Fornecedor } from '../../models';

interface GetFornecedoresInput {
  filter: GetFornecedoresFilter;
  pagination: PaginationParams;
}

@Injectable()
export class GetFornecedoresUseCase implements IUseCase<GetFornecedoresInput, Fornecedor[]> {
  constructor(private readonly repo: FornecedorRepository) {}

  execute({ filter, pagination }: GetFornecedoresInput): Promise<Fornecedor[]> {
    return this.repo.getMany(filter, pagination);
  }
}
