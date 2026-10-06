import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, StatusBadge, formatCurrency } from '@/components/operations'
import { useVendas } from '@/api/operacoes'
import { useClienteMap } from '@/api/lookups'
import type { VendaStatus } from '@/api/types'
import { FORMA_LABEL, formatDate, norm } from '@/lib/format'

export const VENDA_STATUS: Record<VendaStatus, { label: string; tone: 'neutral' | 'success' | 'danger' }> = {
  orcamento: { label: 'Orçamento', tone: 'neutral' },
  fechada: { label: 'Fechada', tone: 'success' },
  cancelada: { label: 'Cancelada', tone: 'danger' },
}

export function VendasPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<VendaStatus | ''>('')
  const [search, setSearch] = useState('')
  const vendas = useVendas({ status })
  const clientes = useClienteMap()

  const clienteNome = (id: string | null) => (id ? clientes.get(id)?.nome : undefined) ?? 'Sem cliente'
  const rows = (vendas.data ?? []).filter((v) => !search || norm(`${v.numero} ${clienteNome(v.clienteId)} ${v.obraRef ?? ''}`).includes(norm(search)))

  return <div className="page-stack">
    <PageHeader eyebrow="Comercial" title="Vendas" description="Orçamentos, pedidos fechados e acompanhamento de pagamento." actions={<button className="button button-primary" type="button" onClick={() => navigate('/vendas/nova')}><Plus size={17} /> Nova venda</button>} />
    <section className="panel table-panel">
      <div className="table-toolbar">
        <div className="filter-group"><select className="filter-button" value={status} onChange={(e) => setStatus(e.target.value as VendaStatus | '')} aria-label="Filtrar por status"><option value="">Todos os status</option><option value="orcamento">Orçamento</option><option value="fechada">Fechada</option><option value="cancelada">Cancelada</option></select></div>
        <label className="search-field"><Search size={16} /><input placeholder="Buscar cliente ou venda" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      </div>
      <table className="data-table">
        <thead><tr><th>Nº</th><th>Cliente</th><th>Data</th><th className="number">Total</th><th>Pagamento</th><th>Status</th><th /></tr></thead>
        <tbody>
          {vendas.isLoading && <tr><td colSpan={7} className="empty-state">Carregando…</td></tr>}
          {vendas.isError && <tr><td colSpan={7} className="empty-state">Não foi possível carregar. {(vendas.error as Error).message}</td></tr>}
          {!vendas.isLoading && !vendas.isError && rows.length === 0 && <tr><td colSpan={7} className="empty-state">Nenhuma venda encontrada.</td></tr>}
          {rows.map((v) => <tr key={v.id} className="clickable" onClick={() => navigate(`/vendas/${v.id}`)}>
            <td className="table-primary">#{v.numero}</td>
            <td><span className="table-primary">{clienteNome(v.clienteId)}</span>{v.obraRef && <span className="table-subline">{v.obraRef}</span>}</td>
            <td>{formatDate(v.dataVenda ?? v.createdAt)}</td>
            <td className="number">{formatCurrency(v.total)}</td>
            <td>{v.status !== 'fechada' ? '—' : v.statusPagamento === 'a_receber' ? 'A receber' : v.formaPagamento ? FORMA_LABEL[v.formaPagamento] : 'Pago'}</td>
            <td><StatusBadge tone={VENDA_STATUS[v.status].tone}>{VENDA_STATUS[v.status].label}</StatusBadge></td>
            <td className="table-actions"><button className="button button-ghost" type="button">{v.status === 'orcamento' ? 'Continuar' : 'Abrir'}</button></td>
          </tr>)}
        </tbody>
      </table>
    </section>
  </div>
}
