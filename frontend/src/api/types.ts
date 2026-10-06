export type EstadoMadeira = 'bruta' | 'aparelhada'
export type Funcao = 'aparelhador' | 'cortador' | 'carregador' | 'motorista'
export type FormaPagamento = 'dinheiro' | 'pix' | 'cartao' | 'prazo'

export interface Cliente {
  id: string
  nome: string
  telefone: string | null
  endereco: string | null
  documento: string | null
  ativo: boolean
}

export interface Fornecedor {
  id: string
  nome: string
  telefone: string | null
  observacao: string | null
  ativo: boolean
}

export interface Funcionario {
  id: string
  nome: string
  funcoes: Funcao[]
  telefone: string | null
  ativo: boolean
}

export interface Caminhao {
  id: string
  descricao: string
  placa: string | null
  ativo: boolean
}

export interface TipoMadeira {
  id: string
  nome: string
  ativo: boolean
}

export interface Produto {
  id: string
  tipoId: string
  estado: EstadoMadeira
  espessuraCm: number
  larguraCm: number
  comprimentoEstoqueM: number
  nome: string
  custo: number
  preco: number
  margemValor: number
  margemPct: number | null
  estoqueMinimo: number
  qtdAtual: number
  ativo: boolean
}

export interface ProdutoInput {
  tipoId: string
  estado: EstadoMadeira
  espessuraCm: number
  larguraCm: number
  comprimentoEstoqueM: number
  custo?: number
  preco: number
  estoqueMinimo?: number
}

export interface CompraInput {
  fornecedorId?: string
  itens: { produtoId: string; quantidade: number; custoUnit: number }[]
}

export interface ReceberCompraInput {
  formaPagamento: FormaPagamento
  vencimento?: string
}

export type VendaStatus = 'orcamento' | 'fechada' | 'cancelada'
export type TipoEntrega = 'retirada' | 'entrega'
export type CompraStatus = 'pedido' | 'recebida' | 'cancelada'
export type EntregaStatus = 'a_carregar' | 'carregado' | 'em_rota' | 'entregue' | 'cancelada'
export type Turno = 'manha' | 'tarde'
export type TarefaTipo = 'preparar' | 'separar'
export type TarefaStatus = 'pendente' | 'concluida'
export type LancSentido = 'entrada' | 'saida'
export type LancSituacao = 'previsto' | 'realizado'
export type LancOrigem = 'venda' | 'compra' | 'avulso'
export type LancCategoria = 'combustivel' | 'salario' | 'energia' | 'manutencao' | 'outro'
