import { GetEntregasUseCase } from './get-entregas/get-entregas.use-case';
import { GetEntregaByIdUseCase } from './get-entrega-by-id/get-entrega-by-id.use-case';
import { UpdateEntregaUseCase } from './update-entrega/update-entrega.use-case';
import { AvancarEntregaUseCase } from './avancar-entrega/avancar-entrega.use-case';

export * from './get-entregas/get-entregas.use-case';
export * from './get-entrega-by-id/get-entrega-by-id.use-case';
export * from './update-entrega/update-entrega.use-case';
export * from './avancar-entrega/avancar-entrega.use-case';

export const EntregaUseCaseHandlers = [
  GetEntregasUseCase,
  GetEntregaByIdUseCase,
  UpdateEntregaUseCase,
  AvancarEntregaUseCase,
];
