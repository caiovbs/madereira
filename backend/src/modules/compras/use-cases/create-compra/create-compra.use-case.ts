import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { ObjectNotFoundError } from '../../../../common/errors';
import { ProdutoRepository } from '../../../produtos/repositories';
import { CompraRepository } from '../../repositories';
import { Compra } from '../../models';
import { CreateCompraDto } from '../../dto';

@Injectable()
export class CreateCompraUseCase implements IUseCase<CreateCompraDto, Compra> {
  constructor(
    private readonly compraRepository: CompraRepository,
    private readonly produtoRepository: ProdutoRepository,
  ) {}

  async execute(input: CreateCompraDto): Promise<Compra> {
    for (const item of input.itens) {
      const produto = await this.produtoRepository.getById(item.produtoId);
      if (!produto) throw new ObjectNotFoundError({ objectType: 'Produto', field: 'id' });
    }
    return this.compraRepository.create(input);
  }
}
