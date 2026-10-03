import { CreateFornecedorUseCase } from './create-fornecedor/create-fornecedor.use-case';
import { GetFornecedoresUseCase } from './get-fornecedores/get-fornecedores.use-case';
import { GetFornecedorByIdUseCase } from './get-fornecedor-by-id/get-fornecedor-by-id.use-case';
import { UpdateFornecedorUseCase } from './update-fornecedor/update-fornecedor.use-case';

export * from './create-fornecedor/create-fornecedor.use-case';
export * from './get-fornecedores/get-fornecedores.use-case';
export * from './get-fornecedor-by-id/get-fornecedor-by-id.use-case';
export * from './update-fornecedor/update-fornecedor.use-case';

export const FornecedorUseCaseHandlers = [
  CreateFornecedorUseCase,
  GetFornecedoresUseCase,
  GetFornecedorByIdUseCase,
  UpdateFornecedorUseCase,
];
