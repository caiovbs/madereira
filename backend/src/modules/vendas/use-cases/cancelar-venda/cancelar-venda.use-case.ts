import { Injectable } from '@nestjs/common'
import { VendaStatus } from '@prisma/client'
import { IUseCase } from '../../../../common/types'
import { BusinessRuleError, ObjectNotFoundError } from '../../../../common/errors'
import { VendaRepository } from '../../repositories'
import { Venda } from '../../models'

@Injectable()
export class CancelarVendaUseCase implements IUseCase<string, Venda> {
  constructor(private readonly vendaRepository: VendaRepository) {}

  async execute(id: string): Promise<Venda> {
    const venda = await this.vendaRepository.getById(id)
    if (!venda) throw new ObjectNotFoundError({ objectType: 'Venda', field: 'id' })
    if (venda.status !== VendaStatus.orcamento) {
      throw new BusinessRuleError('Apenas orçamentos podem ser cancelados.')
    }
    return this.vendaRepository.cancelar(id)
  }
}
