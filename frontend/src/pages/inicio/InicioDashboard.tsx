import { ArrowUpRight, CheckCircle2, PackageCheck, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCard, PageHeader, SectionTitle, StatusBadge, formatCurrency } from '@/components/operations'
import { produtosApi } from '@/api/produtos'
import { useCaixa, useEntregas, useLancamentos, useTarefas, useVendas } from '@/api/operacoes'
import { useClienteMap, useProdutoMap } from '@/api/lookups'
import { ENTREGA_LABEL, TURNO_LABEL, formatDate, isOverdue, isSameDay } from '@/lib/format'

function saudacao() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

export function InicioDashboard() {
  const caixa = useCaixa()
  const previstos = useLancamentos({ situacao: 'previsto' })
  const realizados = useLancamentos({ situacao: 'realizado' })
  const entregas = useEntregas()
  const tarefas = useTarefas()
  const vendas = useVendas()
  const produtos = produtosApi.useList({ pageSize: 1000 })
  const clientes = useClienteMap()
  const produtoMap = useProdutoMap()

  const vendaMap = new Map((vendas.data ?? []).map((v) => [v.id, v]))
  const nomeCliente = (vendaId: string) => { const v = vendaMap.get(vendaId); return (v?.clienteId ? clientes.get(v.clienteId)?.nome : undefined) ?? 'Sem cliente' }

  const aReceber = (previstos.data ?? []).filter((l) => l.sentido === 'entrada')
  const vencidos = aReceber.filter((l) => isOverdue(l.vencimento)).length
  const abertas = (entregas.data ?? []).filter((e) => e.status !== 'entregue' && e.status !== 'cancelada')
  const hoje = abertas.filter((e) => isSameDay(e.dataAgendada))
  const emRota = hoje.filter((e) => e.status === 'em_rota').length
  const alerta = (produtos.data ?? []).filter((p) => p.qtdAtual <= p.estoqueMinimo)
  const entradasHoje = (realizados.data ?? []).filter((l) => isSameDay(l.dataRealizado))
  const saldoHoje = entradasHoje.reduce((s, l) => s + (l.sentido === 'entrada' ? l.valor : -l.valor), 0)
  const fila = [...(tarefas.data ?? [])].sort((a, b) => Number(a.status === 'concluida') - Number(b.status === 'concluida')).slice(0, 4)
  const agenda = [...(hoje.length ? hoje : abertas)].slice(0, 4)
  // Sem isto, uma API fora do ar apareceria como "R$ 0,00" e "0 itens", o que engana.
  const erro = [caixa, previstos, realizados, entregas, tarefas, vendas, produtos].find((q) => q.isError)?.error

  return <div className="page-stack">
    <PageHeader eyebrow="Operação de hoje" title={`${saudacao()}, vamos organizar o pátio.`} description={`${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })} · visão consolidada da madeireira.`} actions={<Link className="button button-secondary" to="/entregas"><ArrowUpRight size={16} /> Ver entregas</Link>} />
    {erro && <div className="panel" style={{ padding: '14px 18px', borderLeft: '4px solid var(--destructive)' }}><strong>Não foi possível carregar os dados.</strong> <span className="muted">{(erro as Error).message} Os números abaixo podem estar incompletos — verifique se a API está rodando.</span></div>}

    <section className="metric-grid">
      <MetricCard label="Saldo em caixa" value={formatCurrency(caixa.data?.saldo ?? 0)} detail={<span className={saldoHoje >= 0 ? 'positive' : 'negative'}>{saldoHoje >= 0 ? '+' : '−'} {formatCurrency(Math.abs(saldoHoje))} hoje</span>} tone="success" />
      <MetricCard label="A receber" value={formatCurrency(aReceber.reduce((s, l) => s + l.valor, 0))} detail={vencidos ? <span className="warning-text">{vencidos} {vencidos === 1 ? 'título vencido' : 'títulos vencidos'}</span> : 'Nenhum título vencido'} tone="warning" />
      <MetricCard label="Entregas de hoje" value={String(hoje.length)} detail={`${emRota} em rota · ${abertas.length} em aberto no total`} tone="info" />
      <MetricCard label="Estoque em alerta" value={`${alerta.length} ${alerta.length === 1 ? 'item' : 'itens'}`} detail={alerta.length ? <span className="warning-text">Reposição recomendada</span> : 'Tudo acima do mínimo'} tone="warning" />
    </section>

    <div className="dashboard-grid">
      <section className="panel dashboard-panel">
        <SectionTitle title={hoje.length ? 'Agenda de entregas de hoje' : 'Próximas entregas'} action={<Link className="section-link" to="/entregas">Ver painel</Link>} />
        <div className="agenda-list">
          {agenda.length === 0 && <p className="empty-state">Nenhuma entrega em aberto.</p>}
          {agenda.map((e) => <div className="agenda-row" key={e.id}>
            <div className="agenda-time">{e.turno ? TURNO_LABEL[e.turno] : formatDate(e.dataAgendada)}</div>
            <div><h3>Venda #{vendaMap.get(e.vendaId)?.numero ?? '…'} · {nomeCliente(e.vendaId)}</h3><p>{e.endereco ?? 'Endereço não informado'}</p></div>
            <StatusBadge tone={e.status === 'em_rota' ? 'info' : e.status === 'a_carregar' ? 'warning' : 'neutral'}>{ENTREGA_LABEL[e.status]}</StatusBadge>
          </div>)}
        </div>
      </section>

      <section className="panel dashboard-panel">
        <SectionTitle title="Fila do pátio" action={<Link className="section-link" to="/patio">Abrir fila</Link>} />
        <div className="task-queue">
          {fila.length === 0 && <p className="empty-state">Nenhuma tarefa no pátio.</p>}
          {fila.map((t) => { const v = vendaMap.get(t.vendaId); const item = v?.itens.find((i) => i.id === t.itemVendaId); const done = t.status === 'concluida'
            return <div className="task-row" key={t.id}>
              <div className="task-icon">{done ? <CheckCircle2 size={16} /> : t.tipo === 'preparar' ? <Wrench size={16} /> : <PackageCheck size={16} />}</div>
              <div><h3>{t.tipo === 'preparar' ? 'Preparar' : 'Separar'} · Venda #{v?.numero ?? '…'}</h3><p>{item ? produtoMap.get(item.produtoId)?.nome : nomeCliente(t.vendaId)}</p></div>
              <StatusBadge tone={done ? 'success' : 'warning'}>{done ? 'Concluída' : 'Pendente'}</StatusBadge>
            </div> })}
        </div>
      </section>
    </div>

    <div className="dashboard-bottom">
      <section className="panel dashboard-panel">
        <SectionTitle title="Atenção no estoque" action={<Link className="section-link" to="/estoque">Ver estoque</Link>} />
        <div className="stock-list">
          {alerta.length === 0 && <p className="empty-state">Nenhum produto abaixo do mínimo.</p>}
          {alerta.slice(0, 5).map((p) => <div className="stock-row" key={p.id}>
            <div><h3>{p.nome}</h3><p>{p.qtdAtual} peças disponíveis · mínimo de {p.estoqueMinimo}</p></div>
            <div className="stock-bar low"><span style={{ width: `${p.estoqueMinimo ? Math.min(100, (p.qtdAtual / p.estoqueMinimo) * 100) : 0}%` }} /></div>
            <StatusBadge tone="warning">Repor {Math.max(p.estoqueMinimo - p.qtdAtual, 1)}</StatusBadge>
          </div>)}
        </div>
      </section>

      <section className="panel dashboard-panel">
        <SectionTitle title="Movimentação de hoje" action={<Link className="section-link" to="/financeiro">Ver caixa</Link>} />
        {entradasHoje.length === 0 ? <p className="empty-state">Nenhuma movimentação hoje.</p> : <table className="mini-table"><thead><tr><th>Descrição</th><th>Valor</th></tr></thead><tbody>
          {entradasHoje.slice(0, 6).map((l) => <tr key={l.id}><td>{l.descricao}</td><td className={l.sentido === 'entrada' ? 'positive' : 'negative'}>{l.sentido === 'entrada' ? '+' : '−'} {formatCurrency(l.valor)}</td></tr>)}
        </tbody></table>}
      </section>
    </div>
  </div>
}
