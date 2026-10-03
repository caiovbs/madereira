import { CreateCompraUseCase } from './create-compra/create-compra.use-case';
import { GetComprasUseCase } from './get-compras/get-compras.use-case';
import { GetCompraByIdUseCase } from './get-compra-by-id/get-compra-by-id.use-case';
import { UpdateCompraUseCase } from './update-compra/update-compra.use-case';
import { ReceberCompraUseCase } from './receber-compra/receber-compra.use-case';
import { CancelarCompraUseCase } from './cancelar-compra/cancelar-compra.use-case';

export * from './create-compra/create-compra.use-case';
export * from './get-compras/get-compras.use-case';
export * from './get-compra-by-id/get-compra-by-id.use-case';
export * from './update-compra/update-compra.use-case';
export * from './receber-compra/receber-compra.use-case';
export * from './cancelar-compra/cancelar-compra.use-case';

export const CompraUseCaseHandlers = [
  CreateCompraUseCase,
  GetComprasUseCase,
  GetCompraByIdUseCase,
  UpdateCompraUseCase,
  ReceberCompraUseCase,
  CancelarCompraUseCase,
];
