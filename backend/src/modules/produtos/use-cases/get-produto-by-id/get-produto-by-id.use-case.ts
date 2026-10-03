import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { ObjectNotFoundError } from '../../../../common/errors';
import { ProdutoRepository } from '../../repositories';
import { Produto } from '../../models';

@Injectable()
export class GetProdutoByIdUseCase implements IUseCase<string, Produto> {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async execute(id: string): Promise<Produto> {
    const produto = await this.produtoRepository.getById(id);
    if (!produto) {
      throw new ObjectNotFoundError({ objectType: 'Produto', field: 'id' });
    }
    return produto;
  }
}
