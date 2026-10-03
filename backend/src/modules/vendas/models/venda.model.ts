import type { FormaPagamento, StatusPagamentoVenda, TipoEntrega, VendaStatus } from '@prisma/client'
import { Entity } from '../../../common/classes'
import { ItemVenda } from './item-venda.model'

export class Venda extends Entity {
  numero: number
  clienteId: string | null
  obraRef: string | null
  status: VendaStatus
  tipoEntrega: TipoEntrega
  subtotal: number
  frete: number
  desconto: number
  total: number
  formaPagamento: FormaPagamento | null
  statusPagamento: StatusPagamentoVenda | null
  dataVenda: Date | null
  itens: ItemVenda[]
}
