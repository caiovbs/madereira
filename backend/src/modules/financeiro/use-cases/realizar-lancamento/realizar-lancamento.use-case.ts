import { Injectable } from '@nestjs/common';
import { LancSituacao } from '@prisma/client';
import { IUseCase } from '../../../../common/types';
import { BusinessRuleError, ObjectNotFoundError } from '../../../../common/errors';
import { LancamentoFinanceiroRepository } from '../../repositories';
import { LancamentoFinanceiro } from '../../models';

@Injectable()
export class RealizarLancamentoUseCase implements IUseCase<string, LancamentoFinanceiro> {
  constructor(private readonly repo: LancamentoFinanceiroRepository) {}

  async execute(id: string): Promise<LancamentoFinanceiro> {
    const lanc = await this.repo.getById(id);
    if (!lanc) throw new ObjectNotFoundError({ objectType: 'LancamentoFinanceiro', field: 'id' });
    if (lanc.situacao === LancSituacao.realizado) {
      throw new BusinessRuleError('Lançamento já está realizado.');
    }
    return this.repo.realizar(id);
  }
}
