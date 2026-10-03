import { Injectable } from '@nestjs/common';
import { PaginationParams } from '../../../common/types';
import {
  CreateProdutoUseCase,
  GetProdutosUseCase,
  GetProdutoByIdUseCase,
  UpdateProdutoUseCase,
} from '../use-cases';
import { GetProdutosFilter } from '../repositories';
import { CreateProdutoDto, UpdateProdutoDto } from '../dto';
import { Produto } from '../models';

@Injectable()
export class ProdutoService {
  constructor(
    private readonly createProdutoUseCase: CreateProdutoUseCase,
    private readonly getProdutosUseCase: GetProdutosUseCase,
    private readonly getProdutoByIdUseCase: GetProdutoByIdUseCase,
    private readonly updateProdutoUseCase: UpdateProdutoUseCase,
  ) {}

  create(input: CreateProdutoDto): Promise<Produto> {
    return this.createProdutoUseCase.execute(input);
  }

  getMany(filter: GetProdutosFilter, pagination: PaginationParams): Promise<Produto[]> {
    return this.getProdutosUseCase.execute({ filter, pagination });
  }

  getById(id: string): Promise<Produto> {
    return this.getProdutoByIdUseCase.execute(id);
  }

  update(id: string, data: UpdateProdutoDto): Promise<Produto> {
    return this.updateProdutoUseCase.execute({ id, data });
  }
}
