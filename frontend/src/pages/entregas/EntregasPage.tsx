import type { ReactNode } from 'react'
import { useState } from 'react'
import { Map as MapIcon, Search, Truck } from 'lucide-react'
import { PageHeader, StatusBadge } from '@/components/operations'
import { funcionariosApi } from '@/api/cadastros'
import { useAvancarEntrega, useEntregas, useTarefas, useVendas } from '@/api/operacoes'
import { useCaminhaoMap, useClienteMap, useFuncionarioMap } from '@/api/lookups'
import type { Entrega } from '@/api/models'
import type { EntregaStatus } from '@/api/types'
import { ENTREGA_LABEL, TURNO_LABEL, formatDate, formatTime, norm } from '@/lib/format'
import { EntregaDialog } from './EntregaDialog'
import { RotaDoDia } from './RotaDoDia'

const COLUNAS: EntregaStatus[] = ['a_carregar', 'carregado', 'em_rota', 'entregue']
const PROXIMA: Partial<Record<EntregaStatus, string>> = { a_carregar: 'Carregado', carregado: 'Em rota', em_rota: 'Entregue' }
const ENTREGUES_VISIVEIS = 10

export function EntregasPage() {
  const [visao, setVisao] = useState<'quadro' | 'rota'>('quadro')
  const [motoristaId, setMotoristaId] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Entrega | null>(null)

  const entregas = useEntregas({ motoristaId })
  const vendas = useVendas()
  const pendentes = useTarefas({ status: 'pendente' })
  const clientes = useClienteMap()
  const caminhoes = useCaminhaoMap()
  const funcionarios = useFuncionarioMap()
  const motoristas = funcionariosApi.useList({ ativo: true, funcao: 'motorista', pageSize: 1000 })
  const avancar = useAvancarEntrega()

  const vendaMap = new Map((vendas.data ?? []).map((v) => [v.id, v]))
  const vendasComPendencia = new Set((pendentes.data ?? []).map((t) => t.vendaId))
  const info = (e: Entrega) => {
    const venda = vendaMap.get(e.vendaId)
    const cliente = venda?.clienteId ? clientes.get(venda.clienteId) : undefined
    return { venda, cliente, nome: cliente?.nome ?? 'Sem cliente', endereco: e.endereco ?? cliente?.endereco ?? 'Endereço não informado' }
  }

  const lista = (entregas.data ?? []).filter((e) => {
    if (!search) return true
    const i = info(e)
    return norm(`${i.venda?.numero ?? ''} ${i.nome} ${i.endereco}`).includes(norm(search))
  })
  const porStatus = (s: EntregaStatus) => lista.filter((e) => e.status === s)
  const editingInfo = editing ? info(editing) : null

  const card = (e: Entrega) => {
    const i = info(e)
    const travada = e.status === 'a_carregar' && vendasComPendencia.has(e.vendaId)
    const agenda = [e.dataAgendada && formatDate(e.dataAgendada), e.turno && TURNO_LABEL[e.turno]].filter(Boolean).join(' · ')
    const equipe = [e.caminhaoId && caminhoes.get(e.caminhaoId)?.descricao, e.motoristaId && funcionarios.get(e.motoristaId)?.nome].filter(Boolean).join(' · ')
    const quando = e.status === 'entregue' ? `Entregue às ${formatTime(e.entregueEm)}` : e.status === 'em_rota' ? `Saiu às ${formatTime(e.saiuEm)}` : travada ? 'Aguardando pátio' : e.status === 'carregado' ? 'Pronta' : (agenda || 'Sem agenda')
    return <article className={`dispatch-card ${travada ? 'locked' : ''}`} key={e.id}>
      <div className="work-item-head"><h3>#{i.venda?.numero ?? '…'} · {i.nome}</h3><StatusBadge tone={e.status === 'entregue' ? 'success' : travada ? 'warning' : 'info'}>{quando}</StatusBadge></div>
      <p>{i.endereco}{i.venda?.tipoEntrega === 'retirada' && ' · Retirada'}</p>
      {(agenda || equipe) && <p>{[agenda, equipe].filter(Boolean).join(' · ')}</p>}
      <footer>
        {e.status !== 'entregue' ? <>
          <button className="button button-ghost" type="button" onClick={() => setEditing(e)}>Programar</button>
          <button className="button button-ghost" type="button" disabled={travada || avancar.isPending} title={travada ? 'Conclua as tarefas do pátio antes de carregar' : undefined} onClick={() => avancar.mutate(e.id)}>{PROXIMA[e.status]}</button>
        </> : <span className="muted">Concluída</span>}
      </footer>
    </article>
  }

  const loading = entregas.isLoading || vendas.isLoading
  return <div className="page-stack">
    <PageHeader eyebrow="Expedição" title="Entregas" description="Acompanhe a carga e o deslocamento. A entrega só pode ser carregada depois que o pátio concluir o preparo." />
    <div className="segmented-choice visao-toggle" role="tablist" aria-label="Visão">
      <button type="button" role="tab" aria-selected={visao === 'quadro'} className={visao === 'quadro' ? 'active' : ''} onClick={() => setVisao('quadro')}><Truck size={14} /> Quadro</button>
      <button type="button" role="tab" aria-selected={visao === 'rota'} className={visao === 'rota' ? 'active' : ''} onClick={() => setVisao('rota')}><MapIcon size={14} /> Rota do dia</button>
    </div>
    {visao === 'rota' ? <RotaDoDia /> : <>
    <div className="toolbar">
      <select className="filter-button" value={motoristaId} onChange={(e) => setMotoristaId(e.target.value)} aria-label="Filtrar por motorista"><option value="">Todos os motoristas</option>{motoristas.data?.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}</select>
      <label className="search-field"><Search size={16} /><input placeholder="Buscar entrega ou cliente" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
    </div>
    {entregas.isError && <p className="empty-state">Não foi possível carregar. {(entregas.error as Error).message}</p>}
    {loading ? <p className="empty-state">Carregando…</p> : <section className="dispatch-board">
      {COLUNAS.map((s) => {
        const items = porStatus(s)
        const visiveis = s === 'entregue' ? items.slice(0, ENTREGUES_VISIVEIS) : items
        return <Column key={s} title={ENTREGA_LABEL[s]} count={items.length}>{visiveis.length === 0 ? <p className="empty-state">Vazio</p> : visiveis.map(card)}{items.length > visiveis.length && <p className="muted" style={{ marginTop: 12, fontSize: 12 }}>+ {items.length - visiveis.length} anteriores</p>}</Column>
      })}
    </section>}
    </>}
    <EntregaDialog entrega={editing} enderecoPadrao={editingInfo?.cliente?.endereco ?? undefined} titulo={editingInfo ? `Venda #${editingInfo.venda?.numero ?? ''} · ${editingInfo.nome}` : ''} onClose={() => setEditing(null)} />
  </div>
}

function Column({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return <section className="dispatch-column"><div className="section-title"><h2>{title}</h2><span className="lane-count">{count}</span></div>{children}</section>
}
