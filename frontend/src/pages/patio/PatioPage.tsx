import type { ReactNode } from 'react'
import { Check, Clock3, Scissors, Search, Truck } from 'lucide-react'
import { FilterButton, PageHeader, StatusBadge } from '@/components/operations'

export function PatioPage() {
  return <div className="page-stack">
    <PageHeader eyebrow="Produção" title="Pátio" description="Fila de preparo e separação dos pedidos antes da retirada ou entrega." actions={<button className="button button-ghost" type="button"><Clock3 size={16} /> Histórico</button>} />
    <div className="toolbar"><FilterButton>Pendentes</FilterButton><FilterButton>Tipo de tarefa</FilterButton><label className="search-field"><Search size={16} /><input placeholder="Buscar venda ou produto" /></label></div>
    <section className="task-board">
      <div className="panel task-lane"><div className="lane-head"><h2>Para preparar</h2><span className="lane-count">2</span></div><WorkItem icon={<Scissors size={16} />} title="Venda #142 · João Silva" product="70 peças · Pinus bruta 5 × 30 · 3,0m" steps={['Cortar para 2,50m', 'Aparelhar']} action="Concluir preparo" /><WorkItem icon={<Scissors size={16} />} title="Venda #151 · Oficina Matos" product="24 peças · Pinus bruta 2,5 × 15 · 3,0m" steps={['Cortar para 1,80m']} action="Concluir preparo" /></div>
      <div className="panel task-lane"><div className="lane-head"><h2>Para separar</h2><span className="lane-count">2</span></div><WorkItem icon={<Truck size={16} />} title="Venda #145 · Construtora Horizonte" product="30 peças · Eucalipto bruta 6 × 6 · 3,0m" steps={['Pedido para retirada']} action="Confirmar separação" /><WorkItem icon={<Truck size={16} />} title="Venda #155 · Maria Oliveira" product="32 peças · Cedrinho aparelhado 2 × 10 · 3,0m" steps={['Entrega às 14:00']} action="Confirmar separação" /></div>
      <div className="panel task-lane"><div className="lane-head"><h2>Concluídas hoje</h2><span className="lane-count">4</span></div><WorkItem done icon={<Check size={16} />} title="Venda #138 · Maria Souza" product="Pedido liberado para expedição" steps={['Preparado às 07:40']} action="Ver venda" /><WorkItem done icon={<Check size={16} />} title="Venda #139 · Depósito Oliveira" product="Pedido separado para retirada" steps={['Separado às 08:05']} action="Ver venda" /></div>
    </section>
  </div>
}

function WorkItem({ icon, title, product, steps, action, done = false }: { icon: ReactNode; title: string; product: string; steps: string[]; action: string; done?: boolean }) {
  return <article className="work-item"><div className="work-item-head"><div className="task-icon">{icon}</div><StatusBadge tone={done ? 'success' : 'warning'}>{done ? 'Concluída' : 'Pendente'}</StatusBadge></div><h3 style={{ marginTop: 12 }}>{title}</h3><p>{product}</p><div className="check-pills">{steps.map((step) => <span className={`check-pill ${done ? 'done' : ''}`} key={step}>{done ? '✓' : '○'} {step}</span>)}</div><footer><span className="muted">{done ? 'Finalizada' : 'Aguardando execução'}</span><button className={done ? 'button button-ghost' : 'button button-primary'} type="button">{action}</button></footer></article>
}
