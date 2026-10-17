import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { FormDialog, Field } from '@/components/FormDialog'
import { ProdutoSearch } from '@/components/ProdutoSearch'
import { formatCurrency } from '@/components/operations'
import { fornecedoresApi } from '@/api/cadastros'
import { produtosApi } from '@/api/produtos'
import { useSalvarCompra } from '@/api/operacoes'
import type { Compra } from '@/api/models'
import type { Produto } from '@/api/types'

type Linha = { produtoId: string; quantidade: number; custoUnit: number }
export type CompraDraft = { compra?: Compra; itens?: Linha[] }

/** Cria ou edita um pedido de compra (ainda não mexe no estoque; isso só acontece ao receber). */
export function CompraDialog({ draft, onClose }: { draft: CompraDraft | null; onClose: () => void }) {
  const fornecedores = fornecedoresApi.useList({ ativo: true, pageSize: 1000 })
  const produtos = produtosApi.useList({ pageSize: 1000 }).data ?? []
  const salvar = useSalvarCompra()
  const [fornecedorId, setFornecedorId] = useState('')
  const [itens, setItens] = useState<Linha[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!draft) return
    setErro('')
    setFornecedorId(draft.compra?.fornecedorId ?? '')
    setItens(draft.compra?.itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade, custoUnit: i.custoUnit })) ?? draft.itens ?? [])
  }, [draft])

  const byId = new Map(produtos.map((p) => [p.id, p]))
  const total = itens.reduce((s, i) => s + i.quantidade * i.custoUnit, 0)

  const add = (p: Produto) => {
    if (itens.some((i) => i.produtoId === p.id)) return
    setItens([...itens, { produtoId: p.id, quantidade: 1, custoUnit: p.custo }])
  }
  const set = (idx: number, patch: Partial<Linha>) => setItens(itens.map((l, i) => (i === idx ? { ...l, ...patch } : l)))

  const submit = () => {
    if (!itens.length) return setErro('Adicione ao menos um item.')
    if (itens.some((i) => !(i.quantidade >= 1) || !Number.isInteger(i.quantidade) || !(i.custoUnit > 0))) {
      return setErro('Informe quantidade inteira (≥ 1) e custo maior que zero em todos os itens.')
    }
    setErro('')
    salvar.mutate({ id: draft?.compra?.id, data: { fornecedorId: fornecedorId || undefined, itens } }, { onSuccess: onClose })
  }

  return <FormDialog open={draft !== null} onOpenChange={(o) => !o && onClose()} title={draft?.compra ? `Editar pedido #${draft.compra.numero}` : 'Nova compra'} description="O estoque só é atualizado quando o pedido for marcado como recebido." submitLabel="Salvar pedido" onSubmit={submit} pending={salvar.isPending}>
    <Field label="Fornecedor (opcional)">
      <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}><option value="">—</option>{fornecedores.data?.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}</select>
    </Field>
    <div className="field"><label>Itens</label><ProdutoSearch produtos={produtos} onPick={add} /></div>
    {itens.length > 0 && <div className="table-panel" style={{ border: '1px solid #e7eeea', borderRadius: 6 }}>
      <table className="data-table"><thead><tr><th>Produto</th><th className="number">Qtd.</th><th className="number">Custo un.</th><th className="number">Subtotal</th><th /></tr></thead><tbody>
        {itens.map((l, idx) => <tr key={l.produtoId}>
          <td style={{ height: 52 }}><span className="table-primary">{byId.get(l.produtoId)?.nome ?? 'Produto'}</span></td>
          <td className="number"><input aria-label="Quantidade" type="number" min={1} step={1} style={{ width: 70, textAlign: 'right' }} value={l.quantidade || ''} onChange={(e) => set(idx, { quantidade: e.target.valueAsNumber })} /></td>
          <td className="number"><input aria-label="Custo unitário" type="number" min={0} step="0.01" style={{ width: 90, textAlign: 'right' }} value={l.custoUnit || ''} onChange={(e) => set(idx, { custoUnit: e.target.valueAsNumber })} /></td>
          <td className="number">{formatCurrency((l.quantidade || 0) * (l.custoUnit || 0))}</td>
          <td className="table-actions"><button className="icon-button" type="button" aria-label="Remover item" onClick={() => setItens(itens.filter((_, i) => i !== idx))}><Trash2 size={16} /></button></td>
        </tr>)}
      </tbody></table>
    </div>}
    <div className="summary-total" style={{ marginTop: 0 }}><span>Total</span><span>{formatCurrency(total)}</span></div>
    {erro && <span className="field-error">{erro}</span>}
  </FormDialog>
}
