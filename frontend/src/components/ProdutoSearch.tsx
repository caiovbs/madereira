import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { Produto } from '@/api/types'
import { norm } from '@/lib/format'

/**
 * Busca rápida de produto: "pinus 5 30" filtra por todos os termos no nome.
 * Enter escolhe o primeiro resultado; o foco permanece no campo para digitar a lista em sequência.
 */
export function ProdutoSearch({ produtos, onPick, placeholder = 'Buscar produto para adicionar (ex.: pinus 5 30)' }: {
  produtos: Produto[]
  onPick: (p: Produto) => void
  placeholder?: string
}) {
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)

  const results = useMemo(() => {
    const tokens = norm(term).split(/\s+/).filter(Boolean)
    if (!tokens.length) return []
    return produtos.filter((p) => tokens.every((t) => norm(p.nome).includes(t))).slice(0, 8)
  }, [term, produtos])

  const pick = (p: Produto) => {
    onPick(p)
    setTerm('')
    setOpen(false)
  }

  return <div style={{ position: 'relative', flex: 1 }}>
    <label className="search-field search-wide" style={{ width: '100%' }}>
      <Search size={16} />
      <input
        placeholder={placeholder}
        value={term}
        onChange={(e) => { setTerm(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (results[0]) pick(results[0]) } }}
      />
    </label>
    {open && term.trim() !== '' && <div className="panel" style={{ position: 'absolute', zIndex: 20, top: 44, left: 0, right: 0, padding: 4, boxShadow: '0 6px 20px rgba(20,40,32,.12)' }}>
      {results.length === 0 && <p className="empty-state" style={{ padding: 14 }}>Nenhum produto encontrado.</p>}
      {results.map((p) => <button key={p.id} type="button" className="button button-ghost" style={{ width: '100%', justifyContent: 'space-between', border: 0 }} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p)}>
        <span>{p.nome}</span><span className="muted">{p.qtdAtual} em estoque</span>
      </button>)}
    </div>}
  </div>
}
