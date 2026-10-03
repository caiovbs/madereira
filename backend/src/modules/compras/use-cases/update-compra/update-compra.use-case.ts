import { Injectable } from '@nestjs/common';
import { CompraStatus } from '@prisma/client';
import { IUseCase } from '../../../../common/types';
import { BusinessRuleError, ObjectNotFoundError } from '../../../../common/errors';
import { CompraRepository } from '../../repositories';
import { Compra } from '../../models';
import { UpdateCompraDto } from '../../dto';

interface UpdateCompraInput {
  id: string;
  data: UpdateCompraDto;
}

@Injectable()
export class UpdateCompraUseCase implements IUseCase<UpdateCompraInput, Compra> {
  constructor(private readonly compraRepository: CompraRepository) {}

  async execute({ id, data }: UpdateCompraInput): Promise<Compra> {
    const compra = await this.compraRepository.getById(id);
    if (!compra) throw new ObjectNotFoundError({ objectType: 'Compra', field: 'id' });
    if (compra.status !== CompraStatus.pedido) {
      throw new BusinessRuleError('Compra só pode ser editada enquanto estiver em status pedido.');
    }
    return this.compraRepository.update(id, data);
  }
}
