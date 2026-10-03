import { ArrowUpRight, CheckCircle2, PackageCheck, Truck, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MetricCard, PageHeader, SectionTitle, StatusBadge } from '@/components/operations'

export function InicioDashboard() {
  return <div className="page-stack">
    <PageHeader eyebrow="Operação de hoje" title="Bom dia, vamos organizar o pátio." description="Quinta-feira, 2 de outubro · visão consolidada da madeireira." actions={<button className="button button-secondary" type="button"><ArrowUpRight size={16} /> Ver agenda</button>} />

    <section className="metric-grid">
      <MetricCard label="Saldo em caixa" value="R$ 8.450,00" detail={<span className="positive">+ R$ 1.320,00 hoje</span>} tone="success" />
      <MetricCard label="A receber" value="R$ 5.200,00" detail={<span className="warning-text">2 títulos vencidos</span>} tone="warning" />
      <MetricCard label="Entregas de hoje" value="6" detail="2 já estão em rota" tone="info" />
      <MetricCard label="Estoque em alerta" value="3 itens" detail={<span className="warning-text">Reposição recomendada</span>} tone="warning" />
    </section>

    <div className="dashboard-grid">
      <section className="panel dashboard-panel">
        <SectionTitle title="Agenda de entregas" action={<Link className="section-link" to="/entregas">Ver painel</Link>} />
        <div className="agenda-list">
          <div className="agenda-row"><div className="agenda-time">08:30</div><div><h3>Venda #142 · João Silva</h3><p>Rua das Palmeiras, 100 · 70 peças</p></div><StatusBadge tone="warning">A carregar</StatusBadge></div>
          <div className="agenda-row"><div className="agenda-time">10:00</div><div><h3>Venda #150 · Construtora Horizonte</h3><p>Av. Industrial, 820 · Caminhão A</p></div><StatusBadge tone="info">Em rota</StatusBadge></div>
          <div className="agenda-row"><div className="agenda-time">14:00</div><div><h3>Venda #155 · Maria Oliveira</h3><p>Estrada do Campo, km 4 · 32 peças</p></div><StatusBadge tone="neutral">Agendada</StatusBadge></div>
        </div>
      </section>

      <section className="panel dashboard-panel">
        <SectionTitle title="Fila do pátio" action={<Link className="section-link" to="/patio">Abrir fila</Link>} />
        <div className="task-queue">
          <div className="task-row"><div className="task-icon"><Wrench size={16} /></div><div><h3>Preparar · Venda #142</h3><p>Pinus bruta 5 × 30 · cortar e aparelhar</p></div><StatusBadge tone="warning">Pendente</StatusBadge></div>
          <div className="task-row"><div className="task-icon"><PackageCheck size={16} /></div><div><h3>Separar · Venda #145</h3><p>Eucalipto 6 × 6 · retirada no balcão</p></div><StatusBadge tone="warning">Pendente</StatusBadge></div>
          <div className="task-row"><div className="task-icon"><CheckCircle2 size={16} /></div><div><h3>Preparar · Venda #138</h3><p>Pedido liberado para expedição</p></div><StatusBadge tone="success">Concluída</StatusBadge></div>
        </div>
      </section>
    </div>

    <div className="dashboard-bottom">
      <section className="panel dashboard-panel">
        <SectionTitle title="Atenção no estoque" action={<Link className="section-link" to="/estoque">Ver estoque</Link>} />
        <div className="stock-list">
          <div className="stock-row"><div><h3>Eucalipto bruta 6 × 6 · 3,0m</h3><p>18 peças disponíveis · mínimo de 40</p></div><div className="stock-bar low"><span style={{ width: '45%' }} /></div><StatusBadge tone="warning">Repor 22</StatusBadge></div>
          <div className="stock-row"><div><h3>Pinus bruta 2,5 × 15 · 3,0m</h3><p>22 peças disponíveis · mínimo de 50</p></div><div className="stock-bar low"><span style={{ width: '44%' }} /></div><StatusBadge tone="warning">Repor 28</StatusBadge></div>
          <div className="stock-row"><div><h3>Pinus aparelhada 5 × 30 · 3,0m</h3><p>120 peças disponíveis · mínimo de 30</p></div><div className="stock-bar"><span style={{ width: '82%' }} /></div><StatusBadge tone="success">Regular</StatusBadge></div>
        </div>
      </section>

      <section className="panel dashboard-panel">
        <SectionTitle title="Movimentação de hoje" action={<Link className="section-link" to="/financeiro">Ver caixa</Link>} />
        <table className="mini-table"><thead><tr><th>Descrição</th><th>Valor</th></tr></thead><tbody>
          <tr><td>Venda #142 · Pix</td><td className="positive">+ R$ 2.804,00</td></tr>
          <tr><td>Combustível · avulso</td><td className="negative">− R$ 180,00</td></tr>
          <tr><td>Recebimento · Venda #138</td><td className="positive">+ R$ 1.500,00</td></tr>
        </tbody></table>
      </section>
    </div>
  </div>
}
