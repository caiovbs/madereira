import { useState } from 'react'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { FilterButton, IconButton, PageHeader, StatusBadge } from '@/components/operations'

export function VendasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [draftOpen, setDraftOpen] = useState(false)
  const editing = draftOpen || searchParams.get('nova') === '1'
  const openEditor = () => {
    setDraftOpen(true)
    setSearchParams({ nova: '1' })
  }
  const closeEditor = () => {
    setDraftOpen(false)
    setSearchParams({})
  }
  if (editing) return <VendaEditor onBack={closeEditor} />
  return <div className="page-stack">
    <PageHeader eyebrow="Comercial" title="Vendas" description="Orçamentos, pedidos fechados e acompanhamento de pagamento." actions={<button className="button button-primary" type="button" onClick={openEditor}><Plus size={17} /> Nova venda</button>} />
    <section className="panel table-panel">
      <div className="table-toolbar"><div className="filter-group"><FilterButton>Status</FilterButton><FilterButton>Período</FilterButton></div><label className="search-field"><Search size={16} /><input placeholder="Buscar cliente ou venda" /></label></div>
      <table className="data-table"><thead><tr><th>Nº</th><th>Cliente</th><th>Data</th><th className="number">Total</th><th>Pagamento</th><th>Status</th><th /></tr></thead><tbody>
        <tr onClick={openEditor}><td className="table-primary">#142</td><td><span className="table-primary">João Silva</span><span className="table-subline">Telhado · Rua das Palmeiras</span></td><td>02 out</td><td className="number">R$ 2.924,00</td><td>A receber</td><td><StatusBadge tone="success">Fechada</StatusBadge></td><td className="table-actions"><IconButton label="Abrir venda #142" /></td></tr>
        <tr><td className="table-primary">#141</td><td><span className="table-primary">Maria Oliveira</span><span className="table-subline">Reforma residencial</span></td><td>01 out</td><td className="number">R$ 820,00</td><td>Pix</td><td><StatusBadge tone="success">Fechada</StatusBadge></td><td className="table-actions"><IconButton label="Abrir venda #141" /></td></tr>
        <tr><td className="table-primary">#140</td><td><span className="table-primary">Construtora Horizonte</span><span className="table-subline">Bloco C · lote 18</span></td><td>01 out</td><td className="number">R$ 5.100,00</td><td>—</td><td><StatusBadge tone="neutral">Orçamento</StatusBadge></td><td className="table-actions"><IconButton label="Abrir venda #140" /></td></tr>
      </tbody></table>
    </section>
  </div>
}

function VendaEditor({ onBack }: { onBack: () => void }) {
  return <div className="page-stack">
    <PageHeader eyebrow="Vendas" title="Nova venda" description="Orçamento em edição" actions={<button className="button button-ghost" type="button" onClick={onBack}><ArrowLeft size={16} /> Voltar para vendas</button>} />
    <div className="editor-layout"><div className="editor-main">
      <section className="panel form-panel"><div className="form-grid"><div className="field"><label>Cliente</label><input defaultValue="João Silva" /></div><div className="field"><label>Obra ou referência</label><input defaultValue="Telhado" /></div><div className="field"><label>Data</label><input defaultValue="02/10/2026" /></div></div></section>
      <section className="panel table-panel"><div className="table-toolbar"><label className="search-field search-wide"><Search size={16} /><input placeholder="Buscar produto para adicionar" /></label><button className="button button-secondary" type="button"><Plus size={16} /> Adicionar item</button></div><table className="data-table"><thead><tr><th>Produto</th><th className="number">Qtd.</th><th className="number">Unitário</th><th className="number">Subtotal</th><th /></tr></thead><tbody><tr><td><span className="table-primary">Pinus bruta 5 × 30 · 3,0m</span><span className="table-subline">Cortar para 2,50m · Aparelhar</span></td><td className="number">70</td><td className="number">R$ 38,00</td><td className="number">R$ 2.660,00</td><td className="table-actions"><IconButton label="Opções do item" /></td></tr><tr><td><span className="table-primary">Pinus bruta 2,5 × 15 · 3,0m</span></td><td className="number">12</td><td className="number">R$ 12,00</td><td className="number">R$ 144,00</td><td className="table-actions"><IconButton label="Opções do item" /></td></tr></tbody></table></section>
    </div><aside className="panel summary-panel"><h2 className="section-title">Resumo</h2><div className="summary-lines"><div className="summary-line"><span>Subtotal</span><span>R$ 2.804,00</span></div><div className="summary-line"><span>Frete</span><span>R$ 120,00</span></div><div className="summary-line"><span>Desconto</span><span>R$ 0,00</span></div></div><div className="summary-total"><span>Total</span><span>R$ 2.924,00</span></div><div className="summary-section"><h3>Entrega</h3><div className="segmented-choice"><button className="active" type="button">Entregar</button><button type="button">Retirada</button></div><div className="field" style={{ marginTop: 12 }}><label>Endereço da obra</label><input defaultValue="Rua das Palmeiras, 100" /></div></div><div className="summary-section"><h3>Pagamento</h3><div className="segmented-choice"><button className="active" type="button">A receber</button><button type="button">Pago</button></div></div><button className="button button-ghost" type="button">Salvar orçamento</button><button className="button button-primary" type="button">Fechar venda</button></aside></div>
  </div>
}
