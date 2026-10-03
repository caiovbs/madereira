import { CreateProdutoUseCase } from './create-produto';
import { GetProdutosUseCase } from './get-produtos';
import { GetProdutoByIdUseCase } from './get-produto-by-id';
import { UpdateProdutoUseCase } from './update-produto';

export * from './create-produto';
export * from './get-produtos';
export * from './get-produto-by-id';
export * from './update-produto';

export const UseCaseHandlers = [
  CreateProdutoUseCase,
  GetProdutosUseCase,
  GetProdutoByIdUseCase,
  UpdateProdutoUseCase,
];
