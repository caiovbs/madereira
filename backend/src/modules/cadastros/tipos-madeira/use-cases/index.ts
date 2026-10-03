import { CreateTipoMadeiraUseCase } from './create-tipo-madeira/create-tipo-madeira.use-case';
import { GetTiposMadeiraUseCase } from './get-tipos-madeira/get-tipos-madeira.use-case';
import { GetTipoMadeiraByIdUseCase } from './get-tipo-madeira-by-id/get-tipo-madeira-by-id.use-case';
import { UpdateTipoMadeiraUseCase } from './update-tipo-madeira/update-tipo-madeira.use-case';

export * from './create-tipo-madeira/create-tipo-madeira.use-case';
export * from './get-tipos-madeira/get-tipos-madeira.use-case';
export * from './get-tipo-madeira-by-id/get-tipo-madeira-by-id.use-case';
export * from './update-tipo-madeira/update-tipo-madeira.use-case';

export const TipoMadeiraUseCaseHandlers = [
  CreateTipoMadeiraUseCase,
  GetTiposMadeiraUseCase,
  GetTipoMadeiraByIdUseCase,
  UpdateTipoMadeiraUseCase,
];
