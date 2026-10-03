import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { LancamentoFinanceiroRepository } from '../../repositories';
import { LancamentoFinanceiro } from '../../models';
import { CreateLancamentoAvulsoDto } from '../../dto';

@Injectable()
export class CreateLancamentoAvulsoUseCase
  implements IUseCase<CreateLancamentoAvulsoDto, LancamentoFinanceiro>
{
  constructor(private readonly repo: LancamentoFinanceiroRepository) {}

  execute(input: CreateLancamentoAvulsoDto): Promise<LancamentoFinanceiro> {
    return this.repo.createAvulso(input);
  }
}
