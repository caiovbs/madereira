import type {
  CompraStatus, EntregaStatus, FormaPagamento, LancCategoria, LancOrigem, LancSentido, LancSituacao,
  TarefaStatus, TarefaTipo, TipoEntrega, Turno, VendaStatus,
} from './types'

export interface ItemVenda {
  id: string
  produtoId: string
  quantidade: number
  precoUnit: number
  cortarParaM: number | null
  aparelhar: boolean
  subtotalLinha: number
}

export interface Venda {
  id: string
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
  statusPagamento: 'pago' | 'a_receber' | null
  dataVenda: string | null
  createdAt: string
  itens: ItemVenda[]
}

export interface VendaInput {
  clienteId?: string | null
  obraRef?: string
  tipoEntrega: TipoEntrega
  frete: number
  desconto: number
  itens: { produtoId: string; quantidade: number; cortarParaM?: number; aparelhar?: boolean }[]
}

export interface ItemCompra {
  id: string
  produtoId: string
  quantidade: number
  custoUnit: number
  subtotalLinha: number
}

export interface Compra {
  id: string
  numero: number
  fornecedorId: string | null
  status: CompraStatus
  total: number
  statusPagamento: 'pago' | 'a_pagar' | null
  formaPagamento: FormaPagamento | null
  vencimento: string | null
  dataPedido: string
  dataRecebida: string | null
  itens: ItemCompra[]
}

export interface TarefaPatio {
  id: string
  vendaId: string
  itemVendaId: string | null
  tipo: TarefaTipo
  status: TarefaStatus
  corteConcluido: boolean
  aparelhoConcluido: boolean
  concluidaEm: string | null
  createdAt: string
}

export interface Entrega {
  id: string
  vendaId: string
  status: EntregaStatus
  caminhaoId: string | null
  motoristaId: string | null
  endereco: string | null
  observacao: string | null
  dataAgendada: string | null
  turno: Turno | null
  carregadoEm: string | null
  saiuEm: string | null
  entregueEm: string | null
  createdAt: string
}

export interface EntregaInput {
  caminhaoId?: string | null
  motoristaId?: string | null
  endereco?: string
  observacao?: string
  dataAgendada?: string
  turno?: Turno
}

export interface Lancamento {
  id: string
  sentido: LancSentido
  situacao: LancSituacao
  origemTipo: LancOrigem
  vendaId: string | null
  compraId: string | null
  descricao: string
  categoria: LancCategoria | null
  valor: number
  vencimento: string | null
  dataRealizado: string | null
  createdAt: string
}

export interface LancamentoAvulsoInput {
  sentido: LancSentido
  descricao: string
  categoria?: LancCategoria
  valor: number
  vencimento?: string
}

export interface Caixa {
  totalEntradas: number
  totalSaidas: number
  saldo: number
}
