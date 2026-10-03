import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { FornecedorRepository } from '../../repositories';
import { Fornecedor } from '../../models';
import { CreateFornecedorDto } from '../../dto';

@Injectable()
export class CreateFornecedorUseCase implements IUseCase<CreateFornecedorDto, Fornecedor> {
  constructor(private readonly repo: FornecedorRepository) {}

  execute(input: CreateFornecedorDto): Promise<Fornecedor> {
    return this.repo.create(input);
  }
}
