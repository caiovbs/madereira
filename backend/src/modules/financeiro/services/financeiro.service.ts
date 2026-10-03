import { Injectable } from '@nestjs/common';
import type { PaginationParams } from '../../../common/types';
import {
  GetLancamentosUseCase,
  GetLancamentoByIdUseCase,
  CreateLancamentoAvulsoUseCase,
  RealizarLancamentoUseCase,
  GetCaixaUseCase,
} from '../use-cases';
import { GetLancamentosFilter, CaixaSummary } from '../repositories';
import { CreateLancamentoAvulsoDto } from '../dto';
import { LancamentoFinanceiro } from '../models';

@Injectable()
export class FinanceiroService {
  constructor(
    private readonly getManyUseCase: GetLancamentosUseCase,
    private readonly getByIdUseCase: GetLancamentoByIdUseCase,
    private readonly createAvulsoUseCase: CreateLancamentoAvulsoUseCase,
    private readonly realizarUseCase: RealizarLancamentoUseCase,
    private readonly getCaixaUseCase: GetCaixaUseCase,
  ) {}

  getMany(filter: GetLancamentosFilter, pagination: PaginationParams): Promise<LancamentoFinanceiro[]> {
    return this.getManyUseCase.execute({ filter, pagination });
  }

  getById(id: string): Promise<LancamentoFinanceiro> {
    return this.getByIdUseCase.execute(id);
  }

  createAvulso(input: CreateLancamentoAvulsoDto): Promise<LancamentoFinanceiro> {
    return this.createAvulsoUseCase.execute(input);
  }

  realizar(id: string): Promise<LancamentoFinanceiro> {
    return this.realizarUseCase.execute(id);
  }

  getCaixa(): Promise<CaixaSummary> {
    return this.getCaixaUseCase.execute();
  }
}
