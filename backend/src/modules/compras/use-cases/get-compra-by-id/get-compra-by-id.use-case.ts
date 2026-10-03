import { Injectable } from '@nestjs/common'
import { IUseCase } from '../../../../common/types'
import { ObjectNotFoundError } from '../../../../common/errors'
import { CompraRepository } from '../../repositories'
import { Compra } from '../../models'

@Injectable()
export class GetCompraByIdUseCase implements IUseCase<string, Compra> {
  constructor(private readonly compraRepository: CompraRepository) {}

  async execute(id: string): Promise<Compra> {
    const compra = await this.compraRepository.getById(id)
    if (!compra) throw new ObjectNotFoundError({ objectType: 'Compra', field: 'id' })
    return compra
  }
}
