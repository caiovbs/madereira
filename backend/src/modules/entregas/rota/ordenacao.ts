export interface Ponto {
  latitude: number;
  longitude: number;
}

export function haversineKm(a: Ponto, b: Ponto): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/**
 * Melhor ordem para visitar `nos`, saindo de `inicio` e (se `fim` != null) terminando em `fim`.
 * Vizinho mais próximo + refinamento 2-opt. Para as 5–20 paradas de um dia é instantâneo
 * e, nessa escala, praticamente sempre ótimo.
 * `custo(a, b)` é o custo de ir de a para b (índices da matriz de distâncias).
 */
export function ordenarCaminho(
  inicio: number,
  nos: number[],
  fim: number | null,
  custo: (a: number, b: number) => number,
): number[] {
  if (nos.length <= 1) return [...nos];

  // Vizinho mais próximo
  const restantes = new Set(nos);
  const ordem: number[] = [];
  let atual = inicio;
  while (restantes.size) {
    let melhor = -1;
    let melhorCusto = Infinity;
    for (const n of restantes) {
      const c = custo(atual, n);
      if (c < melhorCusto) { melhorCusto = c; melhor = n; }
    }
    restantes.delete(melhor);
    ordem.push(melhor);
    atual = melhor;
  }

  // 2-opt: inverte trechos enquanto isso encurtar o caminho
  const p = [inicio, ...ordem, ...(fim !== null ? [fim] : [])];
  const ultimoMovel = fim !== null ? p.length - 2 : p.length - 1;
  let melhorou = true;
  while (melhorou) {
    melhorou = false;
    for (let i = 1; i < ultimoMovel; i++) {
      for (let j = i + 1; j <= ultimoMovel; j++) {
        const temProximo = j + 1 < p.length;
        const delta =
          custo(p[i - 1], p[j]) + (temProximo ? custo(p[i], p[j + 1]) : 0) -
          custo(p[i - 1], p[i]) - (temProximo ? custo(p[j], p[j + 1]) : 0);
        if (delta < -1e-9) {
          p.splice(i, j - i + 1, ...p.slice(i, j + 1).reverse());
          melhorou = true;
        }
      }
    }
  }
  return p.slice(1, fim !== null ? p.length - 1 : p.length);
}
