import { Injectable } from '@nestjs/common';
import { CompraStatus } from '@prisma/client';
import { IUseCase } from '../../../../common/types';
import { BusinessRuleError, ObjectNotFoundError } from '../../../../common/errors';
import { CompraRepository } from '../../repositories';
import { Compra } from '../../models';

@Injectable()
export class CancelarCompraUseCase implements IUseCase<string, Compra> {
  constructor(private readonly compraRepository: CompraRepository) {}

  async execute(id: string): Promise<Compra> {
    const compra = await this.compraRepository.getById(id);
    if (!compra) throw new ObjectNotFoundError({ objectType: 'Compra', field: 'id' });
    if (compra.status !== CompraStatus.pedido) {
      throw new BusinessRuleError('Apenas compras em status pedido podem ser canceladas.');
    }
    return this.compraRepository.cancelar(id);
  }
}
