import { Injectable } from '@nestjs/common';
import type { PaginationParams } from '../../../../common/types';
import {
  CreateFornecedorUseCase,
  GetFornecedoresUseCase,
  GetFornecedorByIdUseCase,
  UpdateFornecedorUseCase,
} from '../use-cases';
import { GetFornecedoresFilter } from '../repositories';
import { CreateFornecedorDto, UpdateFornecedorDto } from '../dto';
import { Fornecedor } from '../models';

@Injectable()
export class FornecedorService {
  constructor(
    private readonly createUseCase: CreateFornecedorUseCase,
    private readonly getManyUseCase: GetFornecedoresUseCase,
    private readonly getByIdUseCase: GetFornecedorByIdUseCase,
    private readonly updateUseCase: UpdateFornecedorUseCase,
  ) {}

  create(input: CreateFornecedorDto): Promise<Fornecedor> {
    return this.createUseCase.execute(input);
  }

  getMany(filter: GetFornecedoresFilter, pagination: PaginationParams): Promise<Fornecedor[]> {
    return this.getManyUseCase.execute({ filter, pagination });
  }

  getById(id: string): Promise<Fornecedor> {
    return this.getByIdUseCase.execute(id);
  }

  update(id: string, data: UpdateFornecedorDto): Promise<Fornecedor> {
    return this.updateUseCase.execute({ id, data });
  }
}
