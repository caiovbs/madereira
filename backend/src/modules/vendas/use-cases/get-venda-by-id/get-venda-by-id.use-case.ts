import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { ObjectNotFoundError } from '../../../../common/errors';
import { VendaRepository } from '../../repositories';
import { Venda } from '../../models';

@Injectable()
export class GetVendaByIdUseCase implements IUseCase<string, Venda> {
  constructor(private readonly vendaRepository: VendaRepository) {}

  async execute(id: string): Promise<Venda> {
    const venda = await this.vendaRepository.getById(id);
    if (!venda) throw new ObjectNotFoundError({ objectType: 'Venda', field: 'id' });
    return venda;
  }
}
