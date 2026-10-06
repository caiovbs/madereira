import { useNavigate } from 'react-router-dom'
import { Bell, Plus } from 'lucide-react'
import { SearchField } from '@/components/operations'

export function Topbar() {
  const navigate = useNavigate()
  const hoje = new Date()

  return (
    <header className="topbar">
      <div className="topbar-search"><SearchField placeholder="Buscar venda, cliente ou produto" /></div>
      <div className="topbar-meta">
        <div className="topbar-date"><strong style={{ textTransform: 'capitalize' }}>{hoje.toLocaleDateString('pt-BR', { weekday: 'long' })}</strong> · {hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</div>
        <button className="icon-button" type="button" title="Notificações" aria-label="Notificações"><Bell size={18} /></button>
        <button className="button button-primary" type="button" onClick={() => navigate('/vendas/nova')}>
          <Plus size={17} />
          Nova venda
        </button>
      </div>
    </header>
  )
}
