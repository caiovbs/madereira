import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, StatusBadge, formatCurrency } from '@/components/operations'
import { useCaixa, useLancamentos, useRealizarLancamento } from '@/api/operacoes'
import type { Lancamento } from '@/api/models'
import { dayOf, formatDate, isOverdue, isSameDay } from '@/lib/format'
import { LancamentoDialog } from './LancamentoDialog'

const tabs = ['Visão geral', 'A receber', 'A pagar', 'Caixa'] as const
type Tab = (typeof tabs)[number]

const sum = (l: Lancamento[]) => l.reduce((s, x) => s + x.valor, 0)
const sinal = (l: Lancamento) => (l.sentido === 'entrada' ? 1 : -1) * l.valor

export function FinanceiroPage() {
  const [tab, setTab] = useState<Tab>('Visão geral')
  const [novo, setNovo] = useState(false)
  const caixa = useCaixa()
  const previstos = useLancamentos({ situacao: 'previsto' })
  const realizados = useLancamentos({ situacao: 'realizado' })
  const realizar = useRealizarLancamento()

  const aReceber = (previstos.data ?? []).filter((l) => l.sentido === 'entrada')
  const aPagar = (previstos.data ?? []).filter((l) => l.sentido === 'saida')
  const saldo = caixa.data?.saldo ?? 0
  const loading = caixa.isLoading || previstos.isLoading || realizados.isLoading
  const erro = caixa.error ?? previstos.error ?? realizados.error

  return <div className="page-stack">
    <PageHeader eyebrow="Financeiro" title="Financeiro" description="Caixa, recebimentos e pagamentos da operação." actions={<button className="button button-primary" type="button" onClick={() => setNovo(true)}><Plus size={17} /> Lançamento</button>} />
    <div className="view-tabs">{tabs.map((t) => <button className={`tab-button ${tab === t ? 'active' : ''}`} type="button" key={t} onClick={() => setTab(t)}>{t}</button>)}</div>
    {erro && <p className="empty-state">Não foi possível carregar. {(erro as Error).message}</p>}
    {loading ? <p className="empty-state">Carregando…</p> : <>
      {tab === 'Visão geral' && <Overview saldo={saldo} aReceber={aReceber} aPagar={aPagar} realizados={realizados.data ?? []} />}
      {tab === 'A receber' && <Titulos title="Títulos a receber" action="Recebi" rows={aReceber} onBaixa={(id) => realizar.mutate(id)} pending={realizar.isPending} />}
      {tab === 'A pagar' && <Titulos title="Títulos a pagar" action="Paguei" rows={aPagar} onBaixa={(id) => realizar.mutate(id)} pending={realizar.isPending} />}
      {tab === 'Caixa' && <Caixa saldo={saldo} rows={realizados.data ?? []} />}
    </>}
    <LancamentoDialog open={novo} onClose={() => setNovo(false)} />
  </div>
}

function Overview({ saldo, aReceber, aPagar, realizados }: { saldo: number; aReceber: Lancamento[]; aPagar: Lancamento[]; realizados: Lancamento[] }) {
  const venceuReceber = aReceber.filter((l) => isOverdue(l.vencimento)).length
  const venceuPagar = aPagar.filter((l) => isOverdue(l.vencimento)).length
  const hoje = realizados.filter((l) => isSameDay(l.dataRealizado))
  const limite = new Date(); limite.setDate(limite.getDate() + 7)
  const proximos7 = [...aReceber, ...aPagar].filter((l) => l.vencimento && dayOf(l.vencimento) <= limite).reduce((s, l) => s + sinal(l), 0)
  const totalReceber = sum(aReceber)
  const totalPagar = sum(aPagar)

  return <>
    <section className="finance-grid">
      <FinanceCard label="Saldo do caixa" value={formatCurrency(saldo)} detail="Entradas − saídas realizadas" tone={saldo >= 0 ? 'positive' : 'negative'} />
      <FinanceCard label="A receber" value={formatCurrency(totalReceber)} detail={venceuReceber ? `${venceuReceber} ${venceuReceber === 1 ? 'título vencido' : 'títulos vencidos'}` : 'Nenhum título vencido'} tone={venceuReceber ? 'warning-text' : 'muted'} />
      <FinanceCard label="A pagar" value={formatCurrency(totalPagar)} detail={venceuPagar ? `${venceuPagar} ${venceuPagar === 1 ? 'título vencido' : 'títulos vencidos'}` : 'Nenhum título vencido'} tone={venceuPagar ? 'warning-text' : 'muted'} />
    </section>
    <div className="finance-layout">
      <section className="panel dashboard-panel">
        <div className="section-title"><h2>Movimentação de hoje</h2><span className="muted">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</span></div>
        {hoje.length === 0 ? <p className="empty-state">Nenhuma movimentação hoje.</p> : <table className="mini-table"><thead><tr><th>Descrição</th><th>Tipo</th><th>Valor</th></tr></thead><tbody>
          {hoje.map((l) => <tr key={l.id}><td>{l.descricao}</td><td><StatusBadge tone={l.sentido === 'entrada' ? 'success' : 'neutral'}>{l.sentido === 'entrada' ? 'Recebido' : 'Pago'}</StatusBadge></td><td className={l.sentido === 'entrada' ? 'positive' : 'negative'}>{l.sentido === 'entrada' ? '+' : '−'} {formatCurrency(l.valor)}</td></tr>)}
        </tbody></table>}
      </section>
      <aside className="panel cash-summary"><p>Previsão de caixa</p><div className="balance">{formatCurrency(saldo + totalReceber - totalPagar)}</div><dl>
        <div><dt>Entradas previstas</dt><dd className="positive">{formatCurrency(totalReceber)}</dd></div>
        <div><dt>Saídas previstas</dt><dd className="negative">{formatCurrency(totalPagar)}</dd></div>
        <div><dt>Próximos 7 dias (líquido)</dt><dd className={proximos7 >= 0 ? 'positive' : 'negative'}>{formatCurrency(proximos7)}</dd></div>
      </dl></aside>
    </div>
  </>
}

function Titulos({ title, action, rows, onBaixa, pending }: { title: string; action: string; rows: Lancamento[]; onBaixa: (id: string) => void; pending: boolean }) {
  const ordered = [...rows].sort((a, b) => (a.vencimento ?? '9').localeCompare(b.vencimento ?? '9'))
  return <section className="panel table-panel"><div className="table-toolbar"><h2 style={{ margin: 0, fontSize: 15 }}>{title}</h2><strong>{formatCurrency(sum(rows))}</strong></div>
    <table className="data-table"><thead><tr><th>Origem</th><th>Vencimento</th><th className="number">Valor</th><th>Status</th><th /></tr></thead><tbody>
      {ordered.length === 0 && <tr><td colSpan={5} className="empty-state">Nenhum título em aberto.</td></tr>}
      {ordered.map((l) => { const vencido = isOverdue(l.vencimento); return <tr key={l.id}>
        <td className="table-primary">{l.descricao}</td>
        <td className={vencido ? 'warning-text' : ''}>{l.vencimento ? formatDate(l.vencimento) : 'Sem vencimento'}</td>
        <td className="number">{formatCurrency(l.valor)}</td>
        <td><StatusBadge tone={vencido ? 'danger' : 'warning'}>{vencido ? 'Vencido' : 'Em aberto'}</StatusBadge></td>
        <td className="table-actions"><button className="button button-secondary" type="button" disabled={pending} onClick={() => onBaixa(l.id)}>{action}</button></td>
      </tr> })}
    </tbody></table></section>
}

function Caixa({ saldo, rows }: { saldo: number; rows: Lancamento[] }) {
  const ordered = [...rows].sort((a, b) => (b.dataRealizado ?? '').localeCompare(a.dataRealizado ?? ''))
  // Saldo corrente: parte do saldo atual e desfaz cada movimento, do mais recente para o mais antigo.
  let corrente = saldo
  const withBalance = ordered.map((l) => { const atual = corrente; corrente -= sinal(l); return { l, atual } })
  return <section className="panel table-panel"><div className="table-toolbar"><h2 style={{ margin: 0, fontSize: 15 }}>Extrato de caixa</h2><strong>Saldo: {formatCurrency(saldo)}</strong></div>
    <table className="data-table"><thead><tr><th>Data</th><th>Descrição</th><th className="number">Entrada</th><th className="number">Saída</th><th className="number">Saldo</th></tr></thead><tbody>
      {withBalance.length === 0 && <tr><td colSpan={5} className="empty-state">Nenhuma movimentação no caixa.</td></tr>}
      {withBalance.map(({ l, atual }) => <tr key={l.id}>
        <td>{formatDate(l.dataRealizado)}</td><td>{l.descricao}</td>
        <td className="number positive">{l.sentido === 'entrada' ? formatCurrency(l.valor) : '—'}</td>
        <td className="number negative">{l.sentido === 'saida' ? formatCurrency(l.valor) : '—'}</td>
        <td className="number">{formatCurrency(atual)}</td>
      </tr>)}
    </tbody></table></section>
}

function FinanceCard({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: string }) {
  return <section className="panel finance-card"><p>{label}</p><strong>{value}</strong><span className={tone}>{detail}</span></section>
}
