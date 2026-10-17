import { Injectable, Logger } from '@nestjs/common'
import { getOsrmUrl } from './rota.config'
import { Ponto, haversineKm } from './ordenacao'

export interface Matriz {
  /** metros entre cada par de pontos */
  distancia: number[][]
  aproximado: boolean
}

export interface Tracado {
  /** [lat, lng] ao longo das ruas, pronto para o Leaflet */
  geometria: Array<[number, number]>
  /** um trecho por par de pontos consecutivos */
  trechos: Array<{ distanciaKm: number; duracaoMin: number }>
  aproximado: boolean
}

const TIMEOUT_MS = 10000
// Sem OSRM: distância em linha reta × fator de sinuosidade, a ~35 km/h.
const FATOR_SINUOSIDADE = 1.35
const VELOCIDADE_MEDIA_KMH = 35

/** Distâncias e traçado pelas ruas via OSRM (gratuito); se ele não responder, estima em linha reta. */
@Injectable()
export class RoutingService {
  private readonly logger = new Logger(RoutingService.name)

  private coords(pontos: Ponto[]): string {
    return pontos.map(p => `${p.longitude},${p.latitude}`).join(';')
  }

  async matriz(pontos: Ponto[]): Promise<Matriz> {
    try {
      const res = await fetch(
        `${getOsrmUrl()}/table/v1/driving/${this.coords(pontos)}?annotations=distance`,
        {
          signal: AbortSignal.timeout(TIMEOUT_MS)
        }
      )
      const json = (await res.json()) as { code: string; distances?: Array<Array<number | null>> }
      if (!res.ok || json.code !== 'Ok' || !json.distances)
        throw new Error(`OSRM table: ${json.code}`)
      const distancia = json.distances.map((linha, i) =>
        linha.map((d, j) => d ?? haversineKm(pontos[i], pontos[j]) * 1000 * FATOR_SINUOSIDADE)
      )
      return { distancia, aproximado: false }
    } catch (err) {
      this.logger.warn(`OSRM indisponível, estimando em linha reta: ${(err as Error).message}`)
      return {
        distancia: pontos.map(a => pontos.map(b => haversineKm(a, b) * 1000 * FATOR_SINUOSIDADE)),
        aproximado: true
      }
    }
  }

  async tracado(pontos: Ponto[]): Promise<Tracado> {
    try {
      const res = await fetch(
        `${getOsrmUrl()}/route/v1/driving/${this.coords(pontos)}?overview=full&geometries=geojson`,
        { signal: AbortSignal.timeout(TIMEOUT_MS) }
      )
      const json = (await res.json()) as {
        code: string
        routes?: Array<{
          geometry: { coordinates: Array<[number, number]> }
          legs: Array<{ distance: number; duration: number }>
        }>
      }
      const rota = json.routes?.[0]
      if (!res.ok || json.code !== 'Ok' || !rota) throw new Error(`OSRM route: ${json.code}`)
      return {
        geometria: rota.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        trechos: rota.legs.map(l => ({
          distanciaKm: Math.round(l.distance / 100) / 10,
          duracaoMin: Math.max(1, Math.round(l.duration / 60))
        })),
        aproximado: false
      }
    } catch (err) {
      this.logger.warn(`OSRM indisponível, traçando em linha reta: ${(err as Error).message}`)
      const trechos = pontos.slice(1).map((p, i) => {
        const km = haversineKm(pontos[i], p) * FATOR_SINUOSIDADE
        return {
          distanciaKm: Math.round(km * 10) / 10,
          duracaoMin: Math.max(1, Math.round((km / VELOCIDADE_MEDIA_KMH) * 60))
        }
      })
      return { geometria: pontos.map(p => [p.latitude, p.longitude]), trechos, aproximado: true }
    }
  }
}
