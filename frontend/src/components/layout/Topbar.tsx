import { useNavigate } from 'react-router-dom'
import { Bell, Plus } from 'lucide-react'
import { SearchField } from '@/components/operations'

export function Topbar() {
  const navigate = useNavigate()

  return (
    <header className="topbar">
      <div className="topbar-search"><SearchField placeholder="Buscar venda, cliente ou produto" /></div>
      <div className="topbar-meta">
        <div className="topbar-date"><strong>Quinta-feira</strong> · 2 de outubro</div>
        <button className="icon-button" type="button" title="Notificações" aria-label="Notificações"><Bell size={18} /></button>
        <button className="button button-primary" type="button" onClick={() => navigate('/vendas?nova=1')}>
          <Plus size={17} />
          Nova venda
        </button>
      </div>
    </header>
  )
}
