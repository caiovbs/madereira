import type { ReactNode } from 'react'
import { useState } from 'react'
import { Check, Scissors, Search, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader, StatusBadge } from '@/components/operations'
import { useConcluirTarefa, useTarefas, useVendas } from '@/api/operacoes'
import { useClienteMap, useProdutoMap } from '@/api/lookups'
import type { TarefaPatio, Venda } from '@/api/models'
import { formatTime, isSameDay, norm } from '@/lib/format'

export function PatioPage() {
  const [search, setSearch] = useState('')
  const tarefas = useTarefas()
  const vendas = useVendas()
  const clientes = useClienteMap()
  const produtos = useProdutoMap()
  const concluir = useConcluirTarefa()

  const vendaMap = new Map((vendas.data ?? []).map((v) => [v.id, v]))
  const cliente = (v?: Venda) => (v?.clienteId ? clientes.get(v.clienteId)?.nome : undefined) ?? 'Sem cliente'

  const describe = (t: TarefaPatio) => {
    const venda = vendaMap.get(t.vendaId)
    const item = venda?.itens.find((i) => i.id === t.itemVendaId)
    const nome = item ? produtos.get(item.produtoId)?.nome ?? 'Produto' : ''
    const title = `Venda #${venda?.numero ?? '…'} · ${cliente(venda)}`
    if (t.tipo === 'preparar' && item) {
      const steps = [
        ...(item.cortarParaM ? [{ label: `Cortar para ${item.cortarParaM}m`, done: t.corteConcluido }] : []),
        ...(item.aparelhar ? [{ label: 'Aparelhar', done: t.aparelhoConcluido }] : []),
      ]
      return { title, product: `${item.quantidade} peças · ${nome}`, steps, venda }
    }
    const qtd = venda?.itens.reduce((s, i) => s + i.quantidade, 0) ?? 0
    return { title, product: `${qtd} peças em ${venda?.itens.length ?? 0} ${venda?.itens.length === 1 ? 'item' : 'itens'}`, steps: [{ label: venda?.tipoEntrega === 'retirada' ? 'Separar para retirada' : 'Separar para entrega', done: t.status === 'concluida' }], venda }
  }

  const matches = (t: TarefaPatio) => {
    if (!search) return true
    const d = describe(t)
    return norm(`${d.title} ${d.product}`).includes(norm(search))
  }

  const all = (tarefas.data ?? []).filter(matches)
  const preparar = all.filter((t) => t.tipo === 'preparar' && t.status === 'pendente')
  const separar = all.filter((t) => t.tipo === 'separar' && t.status === 'pendente')
  const feitas = all.filter((t) => t.status === 'concluida').sort((a, b) => (b.concluidaEm ?? '').localeCompare(a.concluidaEm ?? ''))
  const feitasHoje = feitas.filter((t) => isSameDay(t.concluidaEm))

  const renderItem = (t: TarefaPatio) => {
    const d = describe(t)
    const done = t.status === 'concluida'
    return <WorkItem key={t.id} done={done} icon={done ? <Check size={16} /> : t.tipo === 'preparar' ? <Scissors size={16} /> : <Truck size={16} />} title={d.title} product={d.product} steps={d.steps}
      info={done ? `Finalizada às ${formatTime(t.concluidaEm)}` : 'Aguardando execução'}
      action={done ? <Link className="button button-ghost" to={`/vendas/${t.vendaId}`}>Ver venda</Link> : <button className="button button-primary" type="button" disabled={concluir.isPending} onClick={() => concluir.mutate(t.id)}>{t.tipo === 'preparar' ? 'Concluir preparo' : 'Confirmar separação'}</button>} />
  }

  const loading = tarefas.isLoading || vendas.isLoading
  return <div className="page-stack">
    <PageHeader eyebrow="Produção" title="Pátio" description="Fila de preparo e separação dos pedidos antes da retirada ou entrega." />
    <div className="toolbar"><label className="search-field"><Search size={16} /><input placeholder="Buscar venda, cliente ou produto" value={search} onChange={(e) => setSearch(e.target.value)} /></label></div>
    {tarefas.isError && <p className="empty-state">Não foi possível carregar. {(tarefas.error as Error).message}</p>}
    {loading ? <p className="empty-state">Carregando…</p> : <section className="task-board">
      <Lane title="Para preparar" count={preparar.length} empty="Nada para preparar.">{preparar.map(renderItem)}</Lane>
      <Lane title="Para separar" count={separar.length} empty="Nada para separar.">{separar.map(renderItem)}</Lane>
      <Lane title="Concluídas hoje" count={feitasHoje.length} empty="Nenhuma tarefa concluída hoje.">{feitasHoje.map(renderItem)}</Lane>
    </section>}
  </div>
}

function Lane({ title, count, empty, children }: { title: string; count: number; empty: string; children: ReactNode }) {
  return <div className="panel task-lane"><div className="lane-head"><h2>{title}</h2><span className="lane-count">{count}</span></div>{count === 0 ? <p className="empty-state">{empty}</p> : children}</div>
}

function WorkItem({ icon, title, product, steps, info, action, done = false }: { icon: ReactNode; title: string; product: string; steps: { label: string; done: boolean }[]; info: string; action: ReactNode; done?: boolean }) {
  return <article className="work-item"><div className="work-item-head"><div className="task-icon">{icon}</div><StatusBadge tone={done ? 'success' : 'warning'}>{done ? 'Concluída' : 'Pendente'}</StatusBadge></div><h3 style={{ marginTop: 12 }}>{title}</h3><p>{product}</p><div className="check-pills">{steps.map((s) => <span className={`check-pill ${s.done ? 'done' : ''}`} key={s.label}>{s.done ? '✓' : '○'} {s.label}</span>)}</div><footer><span className="muted">{info}</span>{action}</footer></article>
}
