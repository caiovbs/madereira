import { useState } from 'react'
import { Plus, Search, ShoppingBag } from 'lucide-react'
import { PageHeader, StatusBadge, formatCurrency } from '@/components/operations'
import { PagamentoDialog } from '@/components/PagamentoDialog'
import { produtosApi } from '@/api/produtos'
import { useCancelarCompra, useCompras, useReceberCompra } from '@/api/operacoes'
import { useFornecedorMap, useProdutoMap } from '@/api/lookups'
import type { Compra } from '@/api/models'
import type { CompraStatus } from '@/api/types'
import { FORMA_LABEL, formatDate, isOverdue, norm } from '@/lib/format'
import { CompraDialog, type CompraDraft } from './CompraDialog'

const STATUS: Record<CompraStatus, { label: string; tone: 'warning' | 'success' | 'neutral' }> = {
  pedido: { label: 'Pedido', tone: 'warning' },
  recebida: { label: 'Recebida', tone: 'success' },
  cancelada: { label: 'Cancelada', tone: 'neutral' },
}

export function ComprasPage() {
  const [status, setStatus] = useState<CompraStatus | ''>('')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState<CompraDraft | null>(null)
  const [receber, setReceber] = useState<Compra | null>(null)

  const compras = useCompras({ status })
  const produtos = produtosApi.useList({ pageSize: 1000 })
  const fornecedores = useFornecedorMap()
  const produtoMap = useProdutoMap()
  const receberMut = useReceberCompra()
  const cancelar = useCancelarCompra()

  const reposicao = (produtos.data ?? []).filter((p) => p.qtdAtual <= p.estoqueMinimo)
  const fornecedorNome = (c: Compra) => (c.fornecedorId ? fornecedores.get(c.fornecedorId)?.nome : undefined) ?? 'Sem fornecedor'
  const rows = (compras.data ?? []).filter((c) => !search || norm(`${c.numero} ${fornecedorNome(c)}`).includes(norm(search)))

  return <div className="page-stack">
    <PageHeader eyebrow="Suprimentos" title="Compras" description="Pedidos a fornecedores, recebimento e reposição do estoque." actions={<button className="button button-primary" type="button" onClick={() => setDraft({})}><Plus size={17} /> Nova compra</button>} />

    {reposicao.length > 0 && <section className="panel reorder-panel">
      <div className="section-title"><div><h2>Reposição sugerida</h2><p className="page-description">Produtos no mínimo ou abaixo dele.</p></div><ShoppingBag size={19} className="warning-text" /></div>
      <div className="reorder-list">{reposicao.map((p) => {
        const falta = Math.max(p.estoqueMinimo - p.qtdAtual, 1)
        return <div className="reorder-item" key={p.id}>
          <div><h3>{p.nome}</h3><p>{p.qtdAtual} peças em estoque · mínimo de {p.estoqueMinimo}</p></div>
          <button className="button button-secondary" type="button" onClick={() => setDraft({ itens: [{ produtoId: p.id, quantidade: falta, custoUnit: p.custo }] })}>Criar pedido · +{falta}</button>
        </div>
      })}</div>
    </section>}

    <section className="panel table-panel">
      <div className="table-toolbar">
        <div className="filter-group"><select className="filter-button" value={status} onChange={(e) => setStatus(e.target.value as CompraStatus | '')} aria-label="Filtrar por status"><option value="">Todos os status</option><option value="pedido">Pedido</option><option value="recebida">Recebida</option><option value="cancelada">Cancelada</option></select></div>
        <label className="search-field"><Search size={16} /><input placeholder="Buscar fornecedor ou compra" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      </div>
      <table className="data-table">
        <thead><tr><th>Nº</th><th>Fornecedor</th><th>Data</th><th className="number">Total</th><th>Pagamento</th><th>Status</th><th /></tr></thead>
        <tbody>
          {compras.isLoading && <tr><td colSpan={7} className="empty-state">Carregando…</td></tr>}
          {compras.isError && <tr><td colSpan={7} className="empty-state">Não foi possível carregar. {(compras.error as Error).message}</td></tr>}
          {!compras.isLoading && !compras.isError && rows.length === 0 && <tr><td colSpan={7} className="empty-state">Nenhuma compra encontrada.</td></tr>}
          {rows.map((c) => <tr key={c.id}>
            <td className="table-primary">#{c.numero}</td>
            <td><span className="table-primary">{fornecedorNome(c)}</span><span className="table-subline">{c.itens.length} {c.itens.length === 1 ? 'item' : 'itens'} · {c.itens.slice(0, 2).map((i) => produtoMap.get(i.produtoId)?.nome ?? '').filter(Boolean).join(', ')}</span></td>
            <td>{formatDate(c.dataRecebida ?? c.dataPedido)}</td>
            <td className="number">{formatCurrency(c.total)}</td>
            <td className={c.statusPagamento === 'a_pagar' && isOverdue(c.vencimento) ? 'warning-text' : undefined}>{c.status !== 'recebida' ? '—' : c.statusPagamento === 'a_pagar' ? `A pagar · ${formatDate(c.vencimento)}` : c.formaPagamento ? `Pago · ${FORMA_LABEL[c.formaPagamento]}` : 'Pago'}</td>
            <td><StatusBadge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</StatusBadge></td>
            <td className="table-actions">{c.status === 'pedido' && <>
              <button className="button button-ghost" type="button" onClick={() => setDraft({ compra: c })}>Editar</button>
              <button className="button button-ghost" type="button" disabled={cancelar.isPending} onClick={() => cancelar.mutate(c.id)}>Cancelar</button>
              <button className="button button-secondary" type="button" onClick={() => setReceber(c)}>Marcar recebida</button>
            </>}</td>
          </tr>)}
        </tbody>
      </table>
    </section>

    <CompraDialog draft={draft} onClose={() => setDraft(null)} />
    <PagamentoDialog open={receber !== null} title={`Receber compra #${receber?.numero ?? ''}`} description="Soma as quantidades no estoque, atualiza o custo dos produtos e lança no financeiro." total={receber?.total ?? 0} submitLabel="Confirmar recebimento" pending={receberMut.isPending} onClose={() => setReceber(null)}
      onConfirm={(v) => receber && receberMut.mutate({ id: receber.id, ...v }, { onSuccess: () => setReceber(null) })} />
  </div>
}
