import { Injectable } from '@nestjs/common';
import { IUseCase, PaginationParams } from '../../../../common/types';
import { ProdutoRepository, GetProdutosFilter } from '../../repositories';
import { Produto } from '../../models';

export interface GetProdutosParams {
  filter: GetProdutosFilter;
  pagination: PaginationParams;
}

@Injectable()
export class GetProdutosUseCase implements IUseCase<GetProdutosParams, Produto[]> {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  execute(input: GetProdutosParams): Promise<Produto[]> {
    return this.produtoRepository.getMany(input.filter, input.pagination);
  }
}
