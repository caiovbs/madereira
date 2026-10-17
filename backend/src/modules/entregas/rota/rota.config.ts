// Lidas sob demanda (e não no import) porque o ConfigModule só carrega o .env depois que os módulos são importados.
export interface Deposito {
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
}

/** Ponto de partida e chegada dos caminhões. Coordenadas aproximadas; ajuste via .env. */
export function getDeposito(): Deposito {
  return {
    nome: process.env.DEPOSITO_NOME ?? 'Madeireira Santa Mônica',
    endereco: process.env.DEPOSITO_ENDERECO ?? 'Av. Marginal da Via Anhanguera, 981 - Retiro, Jundiaí/SP',
    latitude: Number(process.env.DEPOSITO_LAT ?? -23.19116),
    longitude: Number(process.env.DEPOSITO_LNG ?? -46.90702),
  };
}

export const getOsrmUrl = () => process.env.OSRM_URL ?? 'https://router.project-osrm.org';

/** Acrescentado a endereços sem cidade/UF para a busca não cair em outra região. */
export const getContextoEndereco = () => process.env.GEOCODE_CONTEXTO ?? 'Jundiaí, SP, Brasil';

/**
 * Tempo de descarga na parada: a entrega só termina depois de descarregar o caminhão.
 * minutos = base (manobra, conferência, assinatura) + por peça + por m³. Ajuste ao ritmo real da equipe.
 */
export function getDescargaConfig() {
  return {
    baseMin: Number(process.env.DESCARGA_BASE_MIN ?? 10),
    minPorPeca: Number(process.env.DESCARGA_MIN_POR_PECA ?? 0.2),
    minPorM3: Number(process.env.DESCARGA_MIN_POR_M3 ?? 5),
  };
}

/** Janelas dos turnos (HH:MM). A tarde só começa depois do almoço; manhã que passa do meio-dia é sinalizada. */
export function getTurnos() {
  return {
    manhaFim: process.env.TURNO_MANHA_FIM ?? '12:00',
    tardeInicio: process.env.TURNO_TARDE_INICIO ?? '13:00',
  };
}

export const getSaidaPadrao = () => process.env.ROTA_SAIDA_PADRAO ?? '08:00';

/** Resultados de geocodificação mais longe que isso da madeireira são descartados como erro. */
export const RAIO_MAX_KM = 80;
