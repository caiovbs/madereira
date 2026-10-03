import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { LancamentoFinanceiroRepository, CaixaSummary } from '../../repositories';

@Injectable()
export class GetCaixaUseCase implements IUseCase<void, CaixaSummary> {
  constructor(private readonly repo: LancamentoFinanceiroRepository) {}

  execute(): Promise<CaixaSummary> {
    return this.repo.getCaixaSummary();
  }
}
