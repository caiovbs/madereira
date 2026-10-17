import { useNavigate } from 'react-router-dom'
import { Bell, Moon, Plus, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { SearchField } from '@/components/operations'

export function Topbar() {
  const navigate = useNavigate()
  const hoje = new Date()
  const { resolvedTheme, setTheme } = useTheme()
  const escuro = resolvedTheme === 'dark'

  return (
    <header className="topbar">
      <div className="topbar-search"><SearchField placeholder="Buscar venda, cliente ou produto" /></div>
      <div className="topbar-meta">
        <div className="topbar-date"><strong style={{ textTransform: 'capitalize' }}>{hoje.toLocaleDateString('pt-BR', { weekday: 'long' })}</strong> · {hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</div>
        <button className="icon-button" type="button" title={escuro ? 'Tema claro' : 'Tema escuro'} aria-label="Alternar tema" onClick={() => setTheme(escuro ? 'light' : 'dark')}>
          {escuro ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className="icon-button" type="button" title="Notificações" aria-label="Notificações"><Bell size={18} /></button>
        <button className="button button-primary" type="button" onClick={() => navigate('/vendas/nova')}>
          <Plus size={17} />
          Nova venda
        </button>
      </div>
    </header>
  )
}
