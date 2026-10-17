import { useEffect, useState } from 'react'
import { Plus, Search, TriangleAlert } from 'lucide-react'
import { PageHeader, StatusBadge, formatCurrency } from '@/components/operations'
import { produtosApi } from '@/api/produtos'
import type { EstadoMadeira, Produto } from '@/api/types'
import { ProdutoDialog } from './ProdutoDialog'
import { EntradaDialog } from './EntradaDialog'
import { tiposMadeiraApi } from '@/api/cadastros'

export function EstoquePage() {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [tipoId, setTipoId] = useState('')
  const [estado, setEstado] = useState<EstadoMadeira | ''>('')
  const [somenteBaixo, setSomenteBaixo] = useState(false)
  const [editing, setEditing] = useState<Produto | 'new' | null>(null)
  const [entrada, setEntrada] = useState<Produto | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const tipos = tiposMadeiraApi.useList({ ativo: true })
  const list = produtosApi.useList({ search: debounced, tipoId, estado })
  const produtos = list.data ?? []
  const isLow = (p: Produto) => p.qtdAtual <= p.estoqueMinimo
  const baixos = produtos.filter(isLow).length
  const visiveis = somenteBaixo ? produtos.filter(isLow) : produtos
  const tipoNome = (id: string) => tipos.data?.find((t) => t.id === id)?.nome ?? ''

  return <div className="page-stack">
    <PageHeader eyebrow="Operação" title="Estoque" description="Saldo por produto, custo e níveis mínimos de reposição." actions={<button className="button button-primary" type="button" onClick={() => setEditing('new')}><Plus size={17} /> Novo produto</button>} />
    <section className="panel table-panel">
      <div className="stock-health">
        <div><span>Itens ativos</span><strong>{produtos.length} produtos</strong></div>
        <div><span>Abaixo do mínimo</span><strong className={baixos ? 'warning-text' : undefined}>{baixos} produtos</strong></div>
        <div><span>Unidades em estoque</span><strong>{produtos.reduce((sum, p) => sum + p.qtdAtual, 0)} peças</strong></div>
      </div>
      <div className="table-toolbar">
        <div className="filter-group">
          <select className="filter-button" value={tipoId} onChange={(e) => setTipoId(e.target.value)} aria-label="Filtrar por tipo"><option value="">Todos os tipos</option>{tipos.data?.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select>
          <select className="filter-button" value={estado} onChange={(e) => setEstado(e.target.value as EstadoMadeira | '')} aria-label="Filtrar por estado"><option value="">Todos os estados</option><option value="bruta">Bruta</option><option value="aparelhada">Aparelhada</option></select>
          <button className="filter-button" type="button" style={somenteBaixo ? { borderColor: '#d49a31', color: '#925b05' } : undefined} onClick={() => setSomenteBaixo((v) => !v)}>Somente baixo</button>
        </div>
        <label className="search-field"><Search size={16} /><input placeholder="Buscar produto" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      </div>
      <table className="data-table">
        <thead><tr><th>Produto</th><th className="number">Qtd.</th><th className="number">Mín.</th><th className="number">Custo</th><th className="number">Preço</th><th className="number">Margem</th><th /></tr></thead>
        <tbody>
          {list.isLoading && <tr><td colSpan={7} className="empty-state">Carregando…</td></tr>}
          {list.isError && <tr><td colSpan={7} className="empty-state">Não foi possível carregar. {(list.error as Error).message}</td></tr>}
          {!list.isLoading && !list.isError && visiveis.length === 0 && <tr><td colSpan={7} className="empty-state">Nenhum produto encontrado.</td></tr>}
          {visiveis.map((p) => <tr key={p.id}>
            <td><span className="table-primary">{p.nome}</span>{isLow(p) ? <span className="table-subline"><TriangleAlert size={12} /> Abaixo do estoque mínimo</span> : <span className="table-subline">{tipoNome(p.tipoId)}</span>}</td>
            <td className={`number${isLow(p) ? ' warning-text' : ''}`}>{p.qtdAtual}</td>
            <td className="number">{p.estoqueMinimo}</td>
            <td className="number">{formatCurrency(p.custo)}</td>
            <td className="number">{formatCurrency(p.preco)}</td>
            <td className={`number ${p.margemValor >= 0 ? 'positive' : 'negative'}`}>{formatCurrency(p.margemValor)}{p.margemPct !== null && ` · ${p.margemPct}%`}</td>
            <td className="table-actions">
              {isLow(p) && <StatusBadge tone="warning">Repor</StatusBadge>}
              <button className="button button-ghost" type="button" onClick={() => setEntrada(p)}>Entrada</button>
              <button className="button button-ghost" type="button" onClick={() => setEditing(p)}>Editar</button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </section>
    <ProdutoDialog produto={editing} onClose={() => setEditing(null)} />
    <EntradaDialog produto={entrada} onClose={() => setEntrada(null)} />
  </div>
}
