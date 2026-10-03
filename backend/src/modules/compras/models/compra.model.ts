import type { CompraStatus, FormaPagamento, StatusPagamentoCompra } from '@prisma/client';
import { Entity } from '../../../common/classes';
import { ItemCompra } from './item-compra.model';

export class Compra extends Entity {
  numero: number;
  fornecedorId: string | null;
  status: CompraStatus;
  total: number;
  statusPagamento: StatusPagamentoCompra | null;
  formaPagamento: FormaPagamento | null;
  vencimento: Date | null;
  dataPedido: Date;
  dataRecebida: Date | null;
  itens: ItemCompra[];
}
