import { CreateFuncionarioUseCase } from './create-funcionario/create-funcionario.use-case';
import { GetFuncionariosUseCase } from './get-funcionarios/get-funcionarios.use-case';
import { GetFuncionarioByIdUseCase } from './get-funcionario-by-id/get-funcionario-by-id.use-case';
import { UpdateFuncionarioUseCase } from './update-funcionario/update-funcionario.use-case';

export * from './create-funcionario/create-funcionario.use-case';
export * from './get-funcionarios/get-funcionarios.use-case';
export * from './get-funcionario-by-id/get-funcionario-by-id.use-case';
export * from './update-funcionario/update-funcionario.use-case';

export const FuncionarioUseCaseHandlers = [
  CreateFuncionarioUseCase,
  GetFuncionariosUseCase,
  GetFuncionarioByIdUseCase,
  UpdateFuncionarioUseCase,
];
