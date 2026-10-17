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
  latitude: number | null
  longitude: number | null
  ordemRota: number | null
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
  latitude?: number
  longitude?: number
}

export interface ParadaRota {
  ordem: number
  entregaId: string
  vendaNumero: number
  cliente: string
  endereco: string
  turno: Turno | null
  status: EntregaStatus
  caminhaoId: string | null
  motoristaId: string | null
  latitude: number
  longitude: number
  /** deslocamento do ponto anterior até esta parada */
  distanciaKm: number
  duracaoMin: number
  /** tempo estimado para descarregar (a entrega só termina depois) */
  descargaMin: number
  pecas: number
  volumeM3: number
  /** espera até o turno da tarde começar */
  esperaMin: number
  chegadaPrevista: string
  fimPrevisto: string
  /** turno da manhã que passa do fim da manhã */
  passaDoTurno: boolean
}

export interface RotaDoDia {
  data: string
  deposito: { nome: string; endereco: string; latitude: number; longitude: number }
  paradas: ParadaRota[]
  semLocalizacao: { entregaId: string; vendaNumero: number; cliente: string; endereco: string | null; motivo: string }[]
  retorno: { distanciaKm: number; duracaoMin: number }
  total: {
    paradas: number
    distanciaKm: number
    /** só dirigindo */
    duracaoMin: number
    descargaMin: number
    esperaMin: number
    /** saída → retorno: dirigindo + descarga + esperas */
    jornadaMin: number
    saida: string
    retornoPrevisto: string
  }
  /** otimizada = sugestão ainda não salva; salva = ordem já aplicada */
  origemOrdem: 'otimizada' | 'salva'
  aproximado: boolean
  geometria: [number, number][]
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
