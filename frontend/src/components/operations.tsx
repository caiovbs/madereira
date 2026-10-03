import type { ReactNode } from 'react'
import { ChevronDown, MoreHorizontal, Search } from 'lucide-react'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <header className="page-header"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="page-description">{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</header>
}

export function SearchField({ placeholder = 'Buscar...' }: { placeholder?: string }) {
  return <label className="search-field"><Search size={16} aria-hidden="true" /><input aria-label={placeholder} placeholder={placeholder} /></label>
}

export function FilterButton({ children }: { children: ReactNode }) {
  return <button className="filter-button" type="button">{children}<ChevronDown size={14} aria-hidden="true" /></button>
}

export function StatusBadge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`status-badge status-${tone}`}>{children}</span>
}

export function MetricCard({ label, value, detail, tone = 'neutral' }: { label: string; value: string; detail: ReactNode; tone?: Tone }) {
  return <section className={`metric-card metric-${tone}`}><p>{label}</p><strong>{value}</strong><span>{detail}</span></section>
}

export function SectionTitle({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="section-title"><h2>{title}</h2>{action}</div>
}

export function IconButton({ label }: { label: string }) {
  return <button className="icon-button" type="button" title={label} aria-label={label}><MoreHorizontal size={18} /></button>
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(value)
}
