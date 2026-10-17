import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Trash2, TriangleAlert } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader, StatusBadge, formatCurrency } from '@/components/operations'
import { PagamentoDialog } from '@/components/PagamentoDialog'
import { ProdutoSearch } from '@/components/ProdutoSearch'
import { clientesApi } from '@/api/cadastros'
import { produtosApi } from '@/api/produtos'
import { useCancelarVenda, useFecharVenda, useSalvarVenda, useVenda } from '@/api/operacoes'
import type { VendaInput } from '@/api/models'
import type { Produto, TipoEntrega } from '@/api/types'
import { VENDA_STATUS } from './VendasPage'

type Linha = { produtoId: string; quantidade: number; cortarParaM: string; aparelhar: boolean }

export function VendaEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const clientes = clientesApi.useList({ ativo: true, pageSize: 1000 })
  const produtos = produtosApi.useList({ pageSize: 1000 }).data ?? []
  const venda = useVenda(id)
  const salvar = useSalvarVenda()
  const fechar = useFecharVenda()
  const cancelar = useCancelarVenda()

  const [clienteId, setClienteId] = useState('')
  const [obraRef, setObraRef] = useState('')
  const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('entrega')
  const [itens, setItens] = useState<Linha[]>([])
  const [frete, setFrete] = useState(0)
  const [desconto, setDesconto] = useState(0)
  const [erro, setErro] = useState('')
  const [pagando, setPagando] = useState(false)
  const [createdId, setCreatedId] = useState<string>()
  const vendaId = id ?? createdId
  const loaded = useRef<string | null>(null)

  // Carrega o orçamento existente uma única vez (evita sobrescrever a edição em andamento a cada refetch).
  useEffect(() => {
    const v = venda.data
    if (!v || loaded.current === v.id) return
    loaded.current = v.id
    setClienteId(v.clienteId ?? '')
    setObraRef(v.obraRef ?? '')
    setTipoEntrega(v.tipoEntrega)
    setFrete(v.frete)
    setDesconto(v.desconto)
    setItens(v.itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade, cortarParaM: i.cortarParaM ? String(i.cortarParaM) : '', aparelhar: i.aparelhar })))
  }, [venda.data])

  const readOnly = !!venda.data && venda.data.status !== 'orcamento'
  const byId = new Map(produtos.map((p) => [p.id, p]))
  const precoDe = (l: Linha) => (readOnly ? venda.data?.itens.find((i) => i.produtoId === l.produtoId)?.precoUnit : undefined) ?? byId.get(l.produtoId)?.preco ?? 0
  const subtotal = itens.reduce((s, l) => s + precoDe(l) * (l.quantidade || 0), 0)
  const total = subtotal + (frete || 0) - (desconto || 0)
  const semEstoque = itens.filter((l) => (byId.get(l.produtoId)?.qtdAtual ?? 0) < l.quantidade)
  const cliente = clientes.data?.find((c) => c.id === clienteId)

  const add = (p: Produto) => {
    if (itens.some((l) => l.produtoId === p.id)) return toast.info('Produto já está na lista; ajuste a quantidade.')
    setItens([...itens, { produtoId: p.id, quantidade: 1, cortarParaM: '', aparelhar: false }])
  }
  const set = (idx: number, patch: Partial<Linha>) => setItens(itens.map((l, i) => (i === idx ? { ...l, ...patch } : l)))

  const validar = (): VendaInput | null => {
    if (!itens.length) { setErro('Adicione ao menos um item.'); return null }
    if (itens.some((l) => !Number.isInteger(l.quantidade) || l.quantidade < 1)) { setErro('A quantidade de cada item deve ser um inteiro maior que zero.'); return null }
    if (itens.some((l) => l.cortarParaM !== '' && !(Number(l.cortarParaM) > 0))) { setErro('O comprimento de corte deve ser maior que zero.'); return null }
    if (total < 0) { setErro('O desconto não pode ser maior que o subtotal + frete.'); return null }
    setErro('')
    return {
      clienteId: clienteId || (vendaId ? null : undefined),
      obraRef: obraRef.trim() || undefined,
      tipoEntrega,
      frete: frete || 0,
      desconto: desconto || 0,
      itens: itens.map((l) => ({ produtoId: l.produtoId, quantidade: l.quantidade, cortarParaM: l.cortarParaM ? Number(l.cortarParaM) : undefined, aparelhar: l.aparelhar })),
    }
  }

  const salvarRascunho = async () => {
    const data = validar()
    if (!data) return null
    const v = await salvar.mutateAsync({ id: vendaId, data })
    loaded.current = v.id
    toast.success('Orçamento salvo.')
    return v
  }

  const onSalvar = async () => {
    const v = await salvarRascunho()
    if (v && !vendaId) navigate(`/vendas/${v.id}`, { replace: true })
  }

  const onFechar = async () => {
    const v = await salvarRascunho()
    if (v) { setCreatedId(v.id); setPagando(true) }
  }

  if (id && venda.isLoading) return <div className="page-stack"><p className="empty-state">Carregando…</p></div>
  if (id && venda.isError) return <div className="page-stack"><p className="empty-state">Não foi possível carregar a venda. {(venda.error as Error).message}</p></div>

  const status = venda.data?.status
  return <div className="page-stack">
    <PageHeader eyebrow="Vendas" title={venda.data ? `Venda #${venda.data.numero}` : 'Nova venda'} description={readOnly ? 'Venda não editável' : 'Orçamento em edição'}
      actions={<>{status && <StatusBadge tone={VENDA_STATUS[status].tone}>{VENDA_STATUS[status].label}</StatusBadge>}<button className="button button-ghost" type="button" onClick={() => navigate('/vendas')}><ArrowLeft size={16} /> Voltar para vendas</button></>} />
    <div className="editor-layout"><div className="editor-main">
      <section className="panel form-panel"><div className="form-grid">
        <div className="field"><label>Cliente</label><select disabled={readOnly} value={clienteId} onChange={(e) => setClienteId(e.target.value)}><option value="">Sem cliente</option>{clientes.data?.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
        <div className="field"><label>Obra ou referência</label><input disabled={readOnly} value={obraRef} onChange={(e) => setObraRef(e.target.value)} placeholder="Ex.: Telhado, Rua das Palmeiras" /></div>
        <div className="field"><label>Endereço do cliente</label><input disabled value={cliente?.endereco ?? ''} placeholder="—" /></div>
      </div></section>

      <section className="panel table-panel">
        {!readOnly && <div className="table-toolbar"><ProdutoSearch produtos={produtos} onPick={add} /></div>}
        <table className="data-table">
          <thead><tr><th>Produto</th><th className="number">Qtd.</th><th className="number">Unitário</th><th className="number">Subtotal</th><th /></tr></thead>
          <tbody>
            {itens.length === 0 && <tr><td colSpan={5} className="empty-state">Nenhum item. Busque um produto acima para começar a lista.</td></tr>}
            {itens.map((l, idx) => {
              const p = byId.get(l.produtoId)
              const falta = (p?.qtdAtual ?? 0) < l.quantidade
              return <tr key={l.produtoId}>
                <td style={{ height: 76 }}>
                  <span className="table-primary">{p?.nome ?? 'Produto'}</span>
                  {readOnly
                    ? <span className="table-subline">{[l.cortarParaM && `Cortar para ${l.cortarParaM}m`, l.aparelhar && 'Aparelhar'].filter(Boolean).join(' · ')}</span>
                    : <span className="table-subline" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                      <label>✂ cortar para <input aria-label="Cortar para (metros)" type="number" min={0} step="0.01" style={{ width: 64 }} value={l.cortarParaM} onChange={(e) => set(idx, { cortarParaM: e.target.value })} /> m</label>
                      <label><input type="checkbox" checked={l.aparelhar} onChange={(e) => set(idx, { aparelhar: e.target.checked })} /> 🪵 aparelhar</label>
                    </span>}
                  {!readOnly && falta && <span className="table-subline warning-text"><TriangleAlert size={12} /> Estoque insuficiente ({p?.qtdAtual ?? 0} disponíveis)</span>}
                </td>
                <td className="number">{readOnly ? l.quantidade : <input aria-label="Quantidade" type="number" min={1} step={1} style={{ width: 70, textAlign: 'right' }} value={l.quantidade || ''} onChange={(e) => set(idx, { quantidade: e.target.valueAsNumber })} />}</td>
                <td className="number">{formatCurrency(precoDe(l))}</td>
                <td className="number">{formatCurrency(precoDe(l) * (l.quantidade || 0))}</td>
                <td className="table-actions">{!readOnly && <button className="icon-button" type="button" aria-label="Remover item" onClick={() => setItens(itens.filter((_, i) => i !== idx))}><Trash2 size={16} /></button>}</td>
              </tr>
            })}
          </tbody>
        </table>
      </section>
    </div>

    <aside className="panel summary-panel">
      <h2 className="section-title">Resumo</h2>
      <div className="summary-lines">
        <div className="summary-line"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
        <div className="summary-line"><span>Frete</span>{readOnly ? <span>{formatCurrency(frete)}</span> : <input aria-label="Frete" type="number" min={0} step="0.01" style={{ width: 100, textAlign: 'right' }} value={frete || ''} placeholder="0,00" onChange={(e) => setFrete(e.target.valueAsNumber)} />}</div>
        <div className="summary-line"><span>Desconto</span>{readOnly ? <span>{formatCurrency(desconto)}</span> : <input aria-label="Desconto" type="number" min={0} step="0.01" style={{ width: 100, textAlign: 'right' }} value={desconto || ''} placeholder="0,00" onChange={(e) => setDesconto(e.target.valueAsNumber)} />}</div>
      </div>
      <div className="summary-total"><span>Total</span><span>{formatCurrency(total)}</span></div>
      <div className="summary-section"><h3>Entrega</h3>
        <div className="segmented-choice"><button className={tipoEntrega === 'entrega' ? 'active' : ''} type="button" disabled={readOnly} onClick={() => setTipoEntrega('entrega')}>Entregar</button><button className={tipoEntrega === 'retirada' ? 'active' : ''} type="button" disabled={readOnly} onClick={() => setTipoEntrega('retirada')}>Retirada</button></div>
      </div>
      {readOnly && venda.data && <div className="summary-section"><h3>Pagamento</h3><p className="muted" style={{ margin: 0 }}>{venda.data.statusPagamento === 'a_receber' ? 'A receber' : 'Pago'}</p></div>}
      {erro && <p className="field-error" style={{ marginTop: 12 }}>{erro}</p>}
      {semEstoque.length > 0 && !readOnly && <p className="field-error" style={{ marginTop: 12 }}>Há itens sem estoque suficiente; ajuste as quantidades para fechar a venda.</p>}
      {!readOnly && <>
        <button className="button button-ghost" type="button" disabled={salvar.isPending} onClick={onSalvar}>Salvar orçamento</button>
        <button className="button button-primary" type="button" disabled={salvar.isPending || semEstoque.length > 0} onClick={onFechar}>Fechar venda</button>
        {vendaId && <button className="button button-danger" type="button" disabled={cancelar.isPending} onClick={() => cancelar.mutate(vendaId, { onSuccess: () => navigate('/vendas') })}>Cancelar orçamento</button>}
      </>}
    </aside></div>

    <PagamentoDialog open={pagando} title="Fechar venda" description="Baixa o estoque, gera as tarefas do pátio, cria a entrega e lança no financeiro." total={total} submitLabel="Fechar venda" pending={fechar.isPending} onClose={() => setPagando(false)}
      onConfirm={(v) => vendaId && fechar.mutate({ id: vendaId, ...v }, { onSuccess: () => { setPagando(false); navigate('/vendas') } })} />
  </div>
}
