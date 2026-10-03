import { Injectable } from '@nestjs/common';
import { IUseCase, PaginationParams } from '../../../../common/types';
import { LancamentoFinanceiroRepository, GetLancamentosFilter } from '../../repositories';
import { LancamentoFinanceiro } from '../../models';

interface GetLancamentosInput {
  filter: GetLancamentosFilter;
  pagination: PaginationParams;
}

@Injectable()
export class GetLancamentosUseCase implements IUseCase<GetLancamentosInput, LancamentoFinanceiro[]> {
  constructor(private readonly repo: LancamentoFinanceiroRepository) {}

  execute({ filter, pagination }: GetLancamentosInput): Promise<LancamentoFinanceiro[]> {
    return this.repo.getMany(filter, pagination);
  }
}
