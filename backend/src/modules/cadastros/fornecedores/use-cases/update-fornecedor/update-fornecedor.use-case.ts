import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectNotFoundError } from '../../../../../common/errors';
import { FornecedorRepository } from '../../repositories';
import { Fornecedor } from '../../models';
import { UpdateFornecedorDto } from '../../dto';

interface UpdateFornecedorInput {
  id: string;
  data: UpdateFornecedorDto;
}

@Injectable()
export class UpdateFornecedorUseCase implements IUseCase<UpdateFornecedorInput, Fornecedor> {
  constructor(private readonly repo: FornecedorRepository) {}

  async execute({ id, data }: UpdateFornecedorInput): Promise<Fornecedor> {
    const existing = await this.repo.getById(id);
    if (!existing) throw new ObjectNotFoundError({ objectType: 'Fornecedor', field: 'id' });
    return this.repo.update(id, data);
  }
}
