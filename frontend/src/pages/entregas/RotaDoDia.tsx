import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ExternalLink, MapPin, Route, Sparkles, TriangleAlert } from 'lucide-react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { StatusBadge } from '@/components/operations'
import { caminhoesApi } from '@/api/cadastros'
import { useRota, useSalvarOrdemRota, useUpdateEntrega } from '@/api/operacoes'
import type { RotaDoDia as Rota } from '@/api/models'
import { TURNO_LABEL } from '@/lib/format'

/** Data local (não UTC) em AAAA-MM-DD. */
function hojeISO() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const pino = (texto: string, classe = '') =>
  L.divIcon({ className: '', html: `<div class="map-pin ${classe}">${texto}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] })

function duracao(min: number) {
  const h = Math.floor(min / 60)
  return h ? `${h}h${String(min % 60).padStart(2, '0')}` : `${min} min`
}

/** Enquadra o mapa quando muda o conjunto de paradas (não quando um pino é arrastado). */
function Enquadrar({ pontos, chave }: { pontos: [number, number][]; chave: string }) {
  const map = useMap()
  useEffect(() => {
    if (pontos.length) map.fitBounds(L.latLngBounds(pontos), { padding: [40, 40], maxZoom: 15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave, map])
  return null
}

function CliqueNoMapa({ ativo, onClique }: { ativo: boolean; onClique: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => ativo && onClique(e.latlng.lat, e.latlng.lng) })
  return null
}

function googleMapsUrl(rota: Rota) {
  const ll = (p: { latitude: number; longitude: number }) => `${p.latitude},${p.longitude}`
  const params = new URLSearchParams({
    api: '1', travelmode: 'driving', origin: ll(rota.deposito), destination: ll(rota.deposito),
    waypoints: rota.paradas.map(ll).join('|'),
  })
  return `https://www.google.com/maps/dir/?${params}`
}

export function RotaDoDia() {
  const [data, setData] = useState(hojeISO)
  const [caminhaoId, setCaminhaoId] = useState('')
  const [saida, setSaida] = useState('08:00')
  const [sugerir, setSugerir] = useState(false)
  const [posicionando, setPosicionando] = useState<string | null>(null)

  const caminhoes = caminhoesApi.useList({ ativo: true, pageSize: 1000 })
  const rota = useRota({ data, caminhaoId, saida, otimizar: sugerir })
  const salvar = useSalvarOrdemRota()
  const atualizar = useUpdateEntrega()
  const r = rota.data

  // Trocar de dia/caminhão volta para a ordem salva.
  useEffect(() => setSugerir(false), [data, caminhaoId])

  const pontos = useMemo<[number, number][]>(
    () => (r ? [[r.deposito.latitude, r.deposito.longitude], ...r.paradas.map((p): [number, number] => [p.latitude, p.longitude])] : []),
    [r],
  )
  const chave = `${data}|${caminhaoId}|${r?.paradas.map((p) => p.entregaId).join(',') ?? ''}`

  const aplicarOrdem = (ids: string[]) => salvar.mutate(ids, { onSuccess: () => setSugerir(false) })
  const mover = (i: number, delta: -1 | 1) => {
    if (!r) return
    const ids = r.paradas.map((p) => p.entregaId)
    ;[ids[i], ids[i + delta]] = [ids[i + delta], ids[i]]
    aplicarOrdem(ids)
  }
  const atualizarPosicao = (entregaId: string, lat: number, lng: number) =>
    atualizar.mutate({ id: entregaId, data: { latitude: lat, longitude: lng } })

  const naoSalva = r?.origemOrdem === 'otimizada' && r.paradas.length > 0

  return <section className="rota-layout">
    <div className="toolbar">
      <input className="filter-button" type="date" value={data} onChange={(e) => e.target.value && setData(e.target.value)} aria-label="Dia da rota" />
      <label className="filter-button rota-saida">Saída <input type="time" value={saida} onChange={(e) => e.target.value && setSaida(e.target.value)} aria-label="Horário de saída do caminhão" /></label>
      <select className="filter-button" value={caminhaoId} onChange={(e) => setCaminhaoId(e.target.value)} aria-label="Filtrar por caminhão">
        <option value="">Todos os caminhões</option>
        {caminhoes.data?.map((c) => <option key={c.id} value={c.id}>{c.descricao}</option>)}
      </select>
      {r && r.paradas.length > 0 && <>
        <button className="button button-secondary" type="button" disabled={rota.isFetching} onClick={() => setSugerir(true)}><Sparkles size={15} /> Sugerir melhor ordem</button>
        {naoSalva && <button className="button button-primary" type="button" disabled={salvar.isPending} onClick={() => aplicarOrdem(r.paradas.map((p) => p.entregaId))}>Aplicar esta ordem</button>}
        <a className="button button-ghost" href={googleMapsUrl(r)} target="_blank" rel="noreferrer"><ExternalLink size={15} /> Abrir no Google Maps</a>
      </>}
    </div>

    {rota.isError && <p className="empty-state">Não foi possível montar a rota. {(rota.error as Error).message}</p>}
    {r?.aproximado && <p className="rota-aviso"><TriangleAlert size={15} /> O serviço de rotas não respondeu: distâncias e traçado são estimativas em linha reta.</p>}

    <div className="rota-grid">
      <div className="panel rota-mapa-wrap">
        {posicionando && <p className="rota-dica">Clique no mapa para marcar o endereço desta entrega.</p>}
        {rota.isFetching && <p className="rota-carregando">{r ? 'Atualizando rota…' : 'Localizando endereços e calculando a rota…'}</p>}
        <MapContainer center={[-23.1857, -46.8978]} zoom={12} className="rota-mapa" scrollWheelZoom>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {r && <>
            <Enquadrar pontos={pontos} chave={chave} />
            <CliqueNoMapa ativo={!!posicionando} onClique={(lat, lng) => { if (posicionando) atualizarPosicao(posicionando, lat, lng); setPosicionando(null) }} />
            {r.geometria.length > 1 && <Polyline positions={r.geometria} pathOptions={{ color: '#1f6b55', weight: 5, opacity: 0.8 }} />}
            <Marker position={[r.deposito.latitude, r.deposito.longitude]} icon={pino('★', 'map-pin-deposito')} zIndexOffset={1000}>
              <Tooltip direction="top" offset={[0, -14]}>{r.deposito.nome} (saída e retorno)</Tooltip>
            </Marker>
            {r.paradas.map((p) => (
              <Marker key={p.entregaId} position={[p.latitude, p.longitude]} icon={pino(String(p.ordem), p.turno === 'tarde' ? 'map-pin-tarde' : '')} draggable
                eventHandlers={{ dragend: (e) => { const { lat, lng } = (e.target as L.Marker).getLatLng(); atualizarPosicao(p.entregaId, lat, lng) } }}>
                <Tooltip direction="top" offset={[0, -14]}>{p.ordem}. {p.cliente} · {p.endereco}<br />Arraste para corrigir a posição</Tooltip>
              </Marker>
            ))}
          </>}
        </MapContainer>
      </div>

      <aside className="panel rota-lista">
        <div className="section-title">
          <h2><Route size={15} style={{ verticalAlign: '-2px' }} /> Ordem das paradas</h2>
          {r && r.paradas.length > 0 && <StatusBadge tone={naoSalva ? 'warning' : 'success'}>{naoSalva ? 'Sugestão (não salva)' : 'Ordem salva'}</StatusBadge>}
        </div>

        {rota.isLoading && <p className="empty-state">Calculando…</p>}
        {r && r.paradas.length === 0 && r.semLocalizacao.length === 0 && <p className="empty-state">Nenhuma entrega agendada para este dia. Use "Programar" no quadro para definir data, turno e caminhão.</p>}

        {r && r.paradas.length > 0 && <>
          <div className="rota-total">
            <div><strong>{r.total.paradas}</strong><span>paradas</span></div>
            <div><strong>{r.total.distanciaKm.toLocaleString('pt-BR')} km</strong><span>rodados</span></div>
            <div><strong>{r.total.retornoPrevisto}</strong><span>volta prevista</span></div>
          </div>
          <p className="rota-composicao">Jornada de <strong>{duracao(r.total.jornadaMin)}</strong> (saída {r.total.saida}): {duracao(r.total.duracaoMin)} dirigindo + {duracao(r.total.descargaMin)} descarregando{r.total.esperaMin > 0 && <> + <span className="warning-text">{duracao(r.total.esperaMin)} parado esperando o turno da tarde</span></>}.</p>
          <ol className="rota-paradas">
            <li className="rota-parada rota-parada-deposito"><span className="route-stop-number rota-num-deposito">★</span><div><h3>{r.deposito.nome}</h3><p>Saída</p></div></li>
            {r.paradas.map((p, i) => (
              <li className="rota-parada" key={p.entregaId}>
                <span className={`route-stop-number ${p.turno === 'tarde' ? 'rota-num-tarde' : ''}`}>{p.ordem}</span>
                <div>
                  <h3>#{p.vendaNumero} · {p.cliente}</h3>
                  <p>{p.endereco}</p>
                  <p>{[p.turno && TURNO_LABEL[p.turno], `${p.distanciaKm.toLocaleString('pt-BR')} km · ${duracao(p.duracaoMin)} de viagem`].filter(Boolean).join(' · ')}</p>
                  {p.esperaMin > 0 && <p className="warning-text">Espera {duracao(p.esperaMin)} até o início do turno da tarde</p>}
                  <p className="rota-horario"><strong>{p.chegadaPrevista}</strong> chega · descarga ~{duracao(p.descargaMin)} <span className="muted">({p.pecas} peças, {p.volumeM3.toLocaleString('pt-BR')} m³)</span> · <strong>{p.fimPrevisto}</strong> conclui</p>
                  {p.passaDoTurno && <p className="negative">Termina depois do fim da manhã</p>}
                </div>
                <div className="rota-mover">
                  <button type="button" className="icon-button" disabled={i === 0 || salvar.isPending} onClick={() => mover(i, -1)} aria-label="Subir"><ArrowUp size={15} /></button>
                  <button type="button" className="icon-button" disabled={i === r.paradas.length - 1 || salvar.isPending} onClick={() => mover(i, 1)} aria-label="Descer"><ArrowDown size={15} /></button>
                </div>
              </li>
            ))}
            <li className="rota-parada rota-parada-deposito"><span className="route-stop-number rota-num-deposito">★</span><div><h3>Retorno à madeireira</h3><p>{r.retorno.distanciaKm.toLocaleString('pt-BR')} km · {duracao(r.retorno.duracaoMin)} · chega {r.total.retornoPrevisto}</p></div></li>
          </ol>
          <p className="muted rota-nota">Manhã vem antes da tarde; dentro de cada turno, a ordem sugerida é a de menor distância. O tempo de descarga é estimado pelo número de peças e pelo volume (a entrega só conclui depois de descarregar). Arraste um pino no mapa se a posição estiver errada.</p>
        </>}

        {r && r.semLocalizacao.length > 0 && <div className="rota-sem-local">
          <h3><MapPin size={14} /> Sem localização no mapa ({r.semLocalizacao.length})</h3>
          {r.semLocalizacao.map((s) => (
            <div className="rota-sem-item" key={s.entregaId}>
              <div><strong>#{s.vendaNumero} · {s.cliente}</strong><p>{s.endereco ?? 'Sem endereço'} — {s.motivo}</p></div>
              <button type="button" className={`button ${posicionando === s.entregaId ? 'button-primary' : 'button-ghost'}`} onClick={() => setPosicionando(posicionando === s.entregaId ? null : s.entregaId)}>
                {posicionando === s.entregaId ? 'Clique no mapa…' : 'Marcar no mapa'}
              </button>
            </div>
          ))}
        </div>}
      </aside>
    </div>
  </section>
}
