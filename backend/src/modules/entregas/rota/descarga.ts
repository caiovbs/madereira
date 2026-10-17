import { getDescargaConfig } from './rota.config';

export interface ItemParaDescarga {
  quantidade: number;
  cortarParaM: unknown; // Decimal | null
  produto: { espessuraCm: unknown; larguraCm: unknown; comprimentoEstoqueM: unknown };
}

export interface Descarga {
  minutos: number;
  pecas: number;
  volumeM3: number;
}

/** Estimativa do tempo para descarregar a entrega, pelo número de peças e pelo volume de madeira. */
export function estimarDescarga(itens: ItemParaDescarga[]): Descarga {
  const cfg = getDescargaConfig();
  let pecas = 0;
  let volumeM3 = 0;
  for (const i of itens) {
    const comprimentoM = Number(i.cortarParaM ?? i.produto.comprimentoEstoqueM);
    pecas += i.quantidade;
    volumeM3 += (i.quantidade * Number(i.produto.espessuraCm) * Number(i.produto.larguraCm) * comprimentoM) / 10000;
  }
  const minutos = Math.max(1, Math.round(cfg.baseMin + pecas * cfg.minPorPeca + volumeM3 * cfg.minPorM3));
  return { minutos, pecas, volumeM3: Math.round(volumeM3 * 100) / 100 };
}

export const paraMinutos = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

export const paraHora = (min: number): string => {
  const d = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(d / 60)).padStart(2, '0')}:${String(d % 60).padStart(2, '0')}`;
};
