import { GetLancamentosUseCase } from './get-lancamentos/get-lancamentos.use-case';
import { GetLancamentoByIdUseCase } from './get-lancamento-by-id/get-lancamento-by-id.use-case';
import { CreateLancamentoAvulsoUseCase } from './create-lancamento-avulso/create-lancamento-avulso.use-case';
import { RealizarLancamentoUseCase } from './realizar-lancamento/realizar-lancamento.use-case';
import { GetCaixaUseCase } from './get-caixa/get-caixa.use-case';

export * from './get-lancamentos/get-lancamentos.use-case';
export * from './get-lancamento-by-id/get-lancamento-by-id.use-case';
export * from './create-lancamento-avulso/create-lancamento-avulso.use-case';
export * from './realizar-lancamento/realizar-lancamento.use-case';
export * from './get-caixa/get-caixa.use-case';

export const FinanceiroUseCaseHandlers = [
  GetLancamentosUseCase,
  GetLancamentoByIdUseCase,
  CreateLancamentoAvulsoUseCase,
  RealizarLancamentoUseCase,
  GetCaixaUseCase,
];
