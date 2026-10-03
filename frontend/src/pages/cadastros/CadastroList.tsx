import type { ReactNode } from 'react'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { IconButton, PageHeader, StatusBadge } from '@/components/operations'

type CadastroRow = { title: string; detail: string; tags?: string[]; status?: 'Ativo' | 'Inativo' }

export function CadastroList({ title, description, singular, rows, summary }: { title: string; description: string; singular: string; rows: CadastroRow[]; summary: ReactNode }) {
  return <div className="page-stack">
    <PageHeader eyebrow="Cadastros" title={title} description={description} actions={<button className="button button-primary" type="button"><Plus size={17} /> Novo {singular}</button>} />
    <div className="directory-layout">
      <section className="panel directory-panel">
        <div className="toolbar"><label className="search-field search-wide"><Search size={16} aria-hidden="true" /><input placeholder={`Buscar ${title.toLowerCase()}...`} /></label><button className="filter-button" type="button"><SlidersHorizontal size={14} /> Filtros</button></div>
        <div className="directory-list">{rows.map((row) => <article className="directory-row" key={row.title}><div className="avatar-letter">{row.title.slice(0, 1)}</div><div className="directory-main"><h3>{row.title}</h3><p>{row.detail}</p></div>{row.tags && <div className="tag-list">{row.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>}<StatusBadge tone={row.status === 'Inativo' ? 'neutral' : 'success'}>{row.status ?? 'Ativo'}</StatusBadge><IconButton label={`Opções de ${row.title}`} /></article>)}</div>
      </section>
      <aside className="panel directory-aside">{summary}</aside>
    </div>
  </div>
}
