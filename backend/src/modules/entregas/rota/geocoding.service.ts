import { Injectable, Logger } from '@nestjs/common';
import { RAIO_MAX_KM, getContextoEndereco, getDeposito } from './rota.config';
import { haversineKm } from './ordenacao';

export interface Coordenada {
  latitude: number;
  longitude: number;
}

const USER_AGENT = 'madereira-app/1.0 (gestao de madeireira)';
const TIMEOUT_MS = 8000;
// A política de uso do Nominatim pede no máximo 1 requisição por segundo.
const INTERVALO_NOMINATIM_MS = 1100;

/**
 * Endereço (texto) → coordenadas, só com serviços gratuitos baseados no OpenStreetMap.
 * Tenta o Nominatim (acha número da casa quando o OSM tem) e cai no Photon (acha a rua).
 */
@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private ultimaChamadaNominatim = 0;

  async localizar(endereco: string): Promise<Coordenada | null> {
    const consulta = this.montarConsulta(endereco);
    // Se o endereço completo (com bairro/número) não existe no mapa, tenta só a rua na cidade.
    const soRua = this.soRua(endereco);
    const candidatos = [
      () => this.nominatim(consulta),
      () => this.photon(consulta),
      ...(soRua ? [() => this.photon(soRua)] : []),
    ];
    for (const tentar of candidatos) {
      const achado = await tentar().catch((err) => {
        this.logger.warn(`Geocodificação falhou: ${(err as Error).message}`);
        return null;
      });
      if (achado && this.dentroDoRaio(achado)) return achado;
    }
    return null;
  }

  private montarConsulta(endereco: string): string {
    const limpo = endereco.replace(/\s+-\s+/g, ', ').replace(/\s+/g, ' ').trim();
    return /\b(SP|São Paulo)\b/i.test(limpo) ? limpo : `${limpo}, ${getContextoEndereco()}`;
  }

  /** "Av. Nove de Julho, 560 - Vila X, Jundiaí" → "Av. Nove de Julho, Jundiaí, SP, Brasil" (null se não der para isolar a rua). */
  private soRua(endereco: string): string | null {
    const rua = endereco.split(/,|\s-\s/)[0].replace(/\s*\d+\s*$/, '').trim();
    return rua.length >= 3 && rua !== endereco.trim() ? `${rua}, ${getContextoEndereco()}` : null;
  }

  private dentroDoRaio(c: Coordenada): boolean {
    const dep = getDeposito();
    return haversineKm(c, dep) <= RAIO_MAX_KM;
  }

  private async nominatim(q: string): Promise<Coordenada | null> {
    const espera = this.ultimaChamadaNominatim + INTERVALO_NOMINATIM_MS - Date.now();
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    this.ultimaChamadaNominatim = Date.now();

    const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q, format: 'jsonv2', limit: '1', countrycodes: 'br',
    })}`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`Nominatim HTTP ${res.status}`);
    const [primeiro] = (await res.json()) as Array<{ lat: string; lon: string }>;
    return primeiro ? { latitude: Number(primeiro.lat), longitude: Number(primeiro.lon) } : null;
  }

  private async photon(q: string): Promise<Coordenada | null> {
    const dep = getDeposito();
    const url = `https://photon.komoot.io/api/?${new URLSearchParams({
      q, limit: '1', lat: String(dep.latitude), lon: String(dep.longitude),
    })}`;
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`Photon HTTP ${res.status}`);
    const json = (await res.json()) as { features?: Array<{ geometry: { coordinates: [number, number] } }> };
    const f = json.features?.[0];
    return f ? { latitude: f.geometry.coordinates[1], longitude: f.geometry.coordinates[0] } : null;
  }
}
