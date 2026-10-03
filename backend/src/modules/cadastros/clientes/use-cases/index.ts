import { CreateClienteUseCase } from './create-cliente/create-cliente.use-case';
import { GetClientesUseCase } from './get-clientes/get-clientes.use-case';
import { GetClienteByIdUseCase } from './get-cliente-by-id/get-cliente-by-id.use-case';
import { UpdateClienteUseCase } from './update-cliente/update-cliente.use-case';

export * from './create-cliente/create-cliente.use-case';
export * from './get-clientes/get-clientes.use-case';
export * from './get-cliente-by-id/get-cliente-by-id.use-case';
export * from './update-cliente/update-cliente.use-case';

export const ClienteUseCaseHandlers = [
  CreateClienteUseCase,
  GetClientesUseCase,
  GetClienteByIdUseCase,
  UpdateClienteUseCase,
];
