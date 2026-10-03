import { EstadoMadeira } from '@prisma/client';
import { Entity } from '../../../common/classes';

export class Produto extends Entity {
  tipoId: string;

  estado: EstadoMadeira;

  espessuraCm: number;

  larguraCm: number;

  comprimentoEstoqueM: number;

  nome: string;

  custo: number;

  preco: number;

  /** preco - custo (calculado) */
  margemValor: number;

  /** margem em % sobre o custo (calculado; null se custo = 0) */
  margemPct: number | null;

  estoqueMinimo: number;

  qtdAtual: number;

  ativo: boolean;
}
