import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { ObjectNotFoundError } from '../../../../common/errors';
import { LancamentoFinanceiroRepository } from '../../repositories';
import { LancamentoFinanceiro } from '../../models';

@Injectable()
export class GetLancamentoByIdUseCase implements IUseCase<string, LancamentoFinanceiro> {
  constructor(private readonly repo: LancamentoFinanceiroRepository) {}

  async execute(id: string): Promise<LancamentoFinanceiro> {
    const lanc = await this.repo.getById(id);
    if (!lanc) throw new ObjectNotFoundError({ objectType: 'LancamentoFinanceiro', field: 'id' });
    return lanc;
  }
}
