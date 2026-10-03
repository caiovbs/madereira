import type { ReactNode } from 'react'
import { CalendarDays, MapPinned, Route, Search, Sparkles } from 'lucide-react'
import { FilterButton, PageHeader, SectionTitle, StatusBadge } from '@/components/operations'

export function EntregasPage() {
  return <div className="page-stack">
    <PageHeader eyebrow="Expedição" title="Entregas" description="Acompanhe a carga, o deslocamento e a sequência de paradas do dia." actions={<button className="button button-primary" type="button"><Route size={17} /> Planejar rota</button>} />
    <div className="toolbar"><FilterButton><CalendarDays size={14} /> Hoje, 2 out</FilterButton><FilterButton>Todos os motoristas</FilterButton><label className="search-field"><Search size={16} /><input placeholder="Buscar entrega ou cliente" /></label></div>
    <div className="delivery-layout">
      <section className="panel route-panel"><SectionTitle title="Rota recomendada · Caminhão A" action={<StatusBadge tone="success"><Sparkles size={12} /> Otimizada</StatusBadge>} /><div className="route-summary"><div className="route-map" aria-label="Prévia da rota com quatro paradas"><span className="route-pin pin-1">1</span><span className="route-pin pin-2">2</span><span className="route-pin pin-3">3</span><span className="route-pin pin-4">4</span></div><div className="route-stop-list"><RouteStop number="1" name="João Silva" detail="Rua das Palmeiras, 100" distance="3,2 km" /><RouteStop number="2" name="Construtora Horizonte" detail="Av. Industrial, 820" distance="4,8 km" /><RouteStop number="3" name="Maria Oliveira" detail="Estrada do Campo, km 4" distance="6,1 km" /><RouteStop number="4" name="Retorno ao pátio" detail="Madeira Norte" distance="5,4 km" /></div></div></section>
      <aside className="panel cash-summary"><p>Economia estimada</p><div className="balance positive">18 km</div><dl><div><dt>Distância total</dt><dd>19,5 km</dd></div><div><dt>Tempo estimado</dt><dd>1h 06min</dd></div><div><dt>Paradas</dt><dd>3 entregas</dd></div></dl><button className="button button-secondary" type="button" style={{ marginTop: 20, width: '100%' }}><MapPinned size={16} /> Ver detalhes da rota</button></aside>
    </div>
    <section className="dispatch-board"><DispatchColumn title="A carregar" count="2"><DispatchCard order="1" client="João Silva" address="Rua das Palmeiras, 100 · manhã" status="Rota 1" action="Carregado" /><DispatchCard client="Construtora Horizonte" address="Aguardando liberação do pátio" locked status="Pátio pendente" /></DispatchColumn><DispatchColumn title="Carregado" count="1"><DispatchCard order="2" client="Pedro Alves" address="Caminhão A · Motorista Zé" status="Pronta" action="Em rota" /></DispatchColumn><DispatchColumn title="Em rota" count="1"><DispatchCard order="3" client="Maria Souza" address="Caminhão B · Motorista Bruno" status="Saiu 09:42" action="Entregue" /></DispatchColumn><DispatchColumn title="Entregue" count="2"><DispatchCard client="Oficina Matos" address="Entregue às 08:18" status="Concluída" delivered /><DispatchCard client="Depósito Oliveira" address="Entregue às 08:47" status="Concluída" delivered /></DispatchColumn></section>
  </div>
}

function RouteStop({ number, name, detail, distance }: { number: string; name: string; detail: string; distance: string }) {
  return <div className="route-stop"><div className="route-stop-number">{number}</div><div><h3>{name}</h3><p>{detail}</p></div><span>{distance}</span></div>
}

function DispatchColumn({ title, count, children }: { title: string; count: string; children: ReactNode }) {
  return <section className="dispatch-column"><div className="section-title"><h2>{title}</h2><span className="lane-count">{count}</span></div>{children}</section>
}

function DispatchCard({ order, client, address, status, action, locked = false, delivered = false }: { order?: string; client: string; address: string; status: string; action?: string; locked?: boolean; delivered?: boolean }) {
  return <article className={`dispatch-card ${locked ? 'locked' : ''}`}><div className="work-item-head"><h3>{order && <span className="route-stop-number" style={{ display: 'inline-grid', marginRight: 7 }}>{order}</span>}{client}</h3><StatusBadge tone={delivered ? 'success' : locked ? 'warning' : 'info'}>{status}</StatusBadge></div><p>{address}</p><footer>{action ? <button className="button button-ghost" type="button">{action}</button> : <span className="muted">Sem ação disponível</span>}</footer></article>
}
