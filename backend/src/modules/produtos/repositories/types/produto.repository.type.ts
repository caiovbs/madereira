import { EstadoMadeira } from '@prisma/client';

export interface CreateProdutoInput {
  tipoId: string;
  estado: EstadoMadeira;
  espessuraCm: number;
  larguraCm: number;
  comprimentoEstoqueM: number;
  nome: string;
  custo: number;
  preco: number;
  estoqueMinimo: number;
}

export interface ProdutoAttributesInput {
  tipoId: string;
  estado: EstadoMadeira;
  espessuraCm: number;
  larguraCm: number;
  comprimentoEstoqueM: number;
}

export interface GetProdutosFilter {
  search?: string;
  tipoId?: string;
  estado?: EstadoMadeira;
}

export type UpdateProdutoInput = Partial<CreateProdutoInput>;
