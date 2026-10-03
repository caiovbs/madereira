import { EstadoMadeira } from '@prisma/client';

interface BuildProdutoNomeInput {
  tipoNome: string;
  estado: EstadoMadeira;
  espessuraCm: number;
  larguraCm: number;
  comprimentoEstoqueM: number;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value).replace('.', ',');
}

/**
 * Gera o nome do produto a partir dos atributos (RF-E2).
 * Ex.: "Pinus Bruta 5×30 3,00m"
 */
export function buildProdutoNome(input: BuildProdutoNomeInput): string {
  const estadoLabel = input.estado.charAt(0).toUpperCase() + input.estado.slice(1);
  const dimensoes = `${formatNumber(input.espessuraCm)}×${formatNumber(input.larguraCm)}`;
  const comprimento = `${input.comprimentoEstoqueM.toFixed(2).replace('.', ',')}m`;
  return `${input.tipoNome} ${estadoLabel} ${dimensoes} ${comprimento}`;
}
