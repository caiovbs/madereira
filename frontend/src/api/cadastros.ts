import { createResource } from './resource'
import type { Caminhao, Cliente, Fornecedor, Funcao, Funcionario, TipoMadeira } from './types'

export const clientesApi = createResource<
  Cliente,
  { nome: string; telefone?: string; endereco?: string; documento?: string }
>('clientes', 'Cliente')

export const fornecedoresApi = createResource<
  Fornecedor,
  { nome: string; telefone?: string; observacao?: string }
>('fornecedores', 'Fornecedor')

export const funcionariosApi = createResource<
  Funcionario,
  { nome: string; funcoes: Funcao[]; telefone?: string }
>('funcionarios', 'Funcionário')

export const caminhoesApi = createResource<Caminhao, { descricao: string; placa?: string }>(
  'caminhoes',
  'Caminhão',
)

export const tiposMadeiraApi = createResource<TipoMadeira, { nome: string }>(
  'tipos-madeira',
  'Tipo de madeira',
)
