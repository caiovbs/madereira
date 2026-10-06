import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { PageHeader, StatusBadge } from '@/components/operations'
import { Field, FormDialog } from '@/components/FormDialog'
import type { CrudResource } from '@/api/resource'

export type FieldDef = {
  name: string
  label: string
  kind?: 'text' | 'multi'
  required?: boolean
  maxLength?: number
  options?: { value: string; label: string }[]
}

type Row = { id: string; ativo: boolean }
type FormValues = Record<string, string | string[]>

export function CadastroList<T extends Row>({ title, description, singular, resource, fields, getRow, summary }: {
  title: string
  description: string
  singular: string
  resource: CrudResource<T>
  fields: FieldDef[]
  getRow: (item: T) => { title: string; detail: string; tags?: string[] }
  summary: string
}) {
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [editing, setEditing] = useState<T | 'new' | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const list = resource.useList({ search: debounced, ativo: !showInactive })
  const create = resource.useCreate()
  const update = resource.useUpdate()
  const form = useForm<FormValues>()

  useEffect(() => {
    if (!editing) return
    const item = editing === 'new' ? null : (editing as unknown as Record<string, unknown>)
    form.reset(Object.fromEntries(fields.map((f) => [f.name, f.kind === 'multi' ? ((item?.[f.name] as string[]) ?? []) : String(item?.[f.name] ?? '')])))
  }, [editing, fields, form])

  const submit = form.handleSubmit((values) => {
    const isNew = editing === 'new'
    const payload = Object.fromEntries(
      Object.entries(values)
        .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v] as const)
        .filter(([, v]) => !(isNew && v === '')),
    )
    const done = { onSuccess: () => setEditing(null) }
    if (isNew) create.mutate(payload, done)
    else update.mutate({ id: (editing as T).id, data: payload }, done)
  })

  const toggleAtivo = (item: T) => update.mutate({ id: item.id, data: { ativo: !item.ativo } })
  const items = list.data ?? []

  return <div className="page-stack">
    <PageHeader eyebrow="Cadastros" title={title} description={description} actions={<button className="button button-primary" type="button" onClick={() => setEditing('new')}><Plus size={17} /> Novo {singular}</button>} />
    <div className="directory-layout">
      <section className="panel directory-panel">
        <div className="toolbar">
          <label className="search-field search-wide"><Search size={16} aria-hidden="true" /><input placeholder={`Buscar ${title.toLowerCase()}...`} value={search} onChange={(e) => setSearch(e.target.value)} /></label>
          <button className="filter-button" type="button" onClick={() => setShowInactive((v) => !v)}>{showInactive ? 'Mostrando inativos' : 'Mostrando ativos'}</button>
        </div>
        <div className="directory-list">
          {list.isLoading && <p className="empty-state">Carregando…</p>}
          {list.isError && <p className="empty-state">Não foi possível carregar. {(list.error as Error).message}</p>}
          {!list.isLoading && !list.isError && items.length === 0 && <p className="empty-state">Nenhum registro encontrado.</p>}
          {items.map((item) => {
            const row = getRow(item)
            return <article className="directory-row" key={item.id}>
              <div className="avatar-letter">{row.title.slice(0, 1).toUpperCase()}</div>
              <div className="directory-main"><h3>{row.title}</h3><p>{row.detail}</p></div>
              <div className="tag-list">{row.tags?.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
              <StatusBadge tone={item.ativo ? 'success' : 'neutral'}>{item.ativo ? 'Ativo' : 'Inativo'}</StatusBadge>
              <div className="page-actions">
                <button className="button button-ghost" type="button" onClick={() => setEditing(item)}>Editar</button>
                <button className="button button-ghost" type="button" onClick={() => toggleAtivo(item)} disabled={update.isPending}>{item.ativo ? 'Inativar' : 'Reativar'}</button>
              </div>
            </article>
          })}
        </div>
      </section>
      <aside className="panel directory-aside"><h2>{title}</h2><p>{summary}</p><dl><div><dt>{showInactive ? 'Inativos' : 'Ativos'} na lista</dt><dd>{items.length}</dd></div></dl></aside>
    </div>
    <FormDialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} title={editing === 'new' ? `Novo ${singular}` : `Editar ${singular}`} onSubmit={submit} pending={create.isPending || update.isPending}>
      {fields.map((f) => <Field key={f.name} label={f.label} error={form.formState.errors[f.name]?.message as string | undefined}>
        {f.kind === 'multi'
          ? <div className="check-group">{f.options?.map((o) => <label className="check-option" key={o.value}><input type="checkbox" value={o.value} {...form.register(f.name)} />{o.label}</label>)}</div>
          : <input maxLength={f.maxLength} {...form.register(f.name, { required: f.required ? 'Campo obrigatório' : false, minLength: f.required ? { value: 2, message: 'Mínimo de 2 caracteres' } : undefined })} />}
      </Field>)}
    </FormDialog>
  </div>
}
