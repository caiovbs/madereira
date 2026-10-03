import { CreateVendaUseCase } from './create-venda/create-venda.use-case';
import { GetVendasUseCase } from './get-vendas/get-vendas.use-case';
import { GetVendaByIdUseCase } from './get-venda-by-id/get-venda-by-id.use-case';
import { UpdateVendaUseCase } from './update-venda/update-venda.use-case';
import { FecharVendaUseCase } from './fechar-venda/fechar-venda.use-case';
import { CancelarVendaUseCase } from './cancelar-venda/cancelar-venda.use-case';

export * from './create-venda/create-venda.use-case';
export * from './get-vendas/get-vendas.use-case';
export * from './get-venda-by-id/get-venda-by-id.use-case';
export * from './update-venda/update-venda.use-case';
export * from './fechar-venda/fechar-venda.use-case';
export * from './cancelar-venda/cancelar-venda.use-case';

export const VendaUseCaseHandlers = [
  CreateVendaUseCase,
  GetVendasUseCase,
  GetVendaByIdUseCase,
  UpdateVendaUseCase,
  FecharVendaUseCase,
  CancelarVendaUseCase,
];
