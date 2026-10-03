import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectNotFoundError } from '../../../../../common/errors';
import { FornecedorRepository } from '../../repositories';
import { Fornecedor } from '../../models';

@Injectable()
export class GetFornecedorByIdUseCase implements IUseCase<string, Fornecedor> {
  constructor(private readonly repo: FornecedorRepository) {}

  async execute(id: string): Promise<Fornecedor> {
    const fornecedor = await this.repo.getById(id);
    if (!fornecedor) throw new ObjectNotFoundError({ objectType: 'Fornecedor', field: 'id' });
    return fornecedor;
  }
}
