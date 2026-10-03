import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { Home, ShoppingCart, Package, Truck, Wrench, DollarSign, Users, ChevronDown, ChevronRight, Building2, UserCog, Boxes, Layers3, Warehouse } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Visão geral', icon: Home, exact: true },
  { to: '/vendas', label: 'Vendas', icon: ShoppingCart },
  { to: '/estoque', label: 'Estoque', icon: Package },
  { to: '/compras', label: 'Compras', icon: Boxes },
  { to: '/patio', label: 'Pátio', icon: Wrench },
  { to: '/entregas', label: 'Entregas', icon: Truck },
  { to: '/financeiro', label: 'Financeiro', icon: DollarSign },
]

const cadastrosItems = [
  { to: '/cadastros/clientes', label: 'Clientes', icon: Users },
  { to: '/cadastros/fornecedores', label: 'Fornecedores', icon: Building2 },
  { to: '/cadastros/funcionarios', label: 'Funcionários', icon: UserCog },
  { to: '/cadastros/caminhoes', label: 'Caminhões', icon: Truck },
]

export function Sidebar() {
  const [cadastrosOpen, setCadastrosOpen] = useState(false)

  return (
    <aside className="app-sidebar">
      <div className="brand">
        <div className="brand-mark"><Layers3 size={19} /></div>
        <div className="brand-copy"><strong>Madeira Norte</strong><span>Gestão operacional</span></div>
      </div>

      <nav className="side-nav" aria-label="Navegação principal">
        <p className="nav-group-label">Operação</p>
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'nav-item',
                isActive && 'active',
              )
            }
          >
            <Icon size={17} /><span>{label}</span>
          </NavLink>
        ))}
        <p className="nav-group-label">Base</p>
        <button
          onClick={() => setCadastrosOpen((v) => !v)}
          className="cadastros-toggle"
          title="Cadastros"
        >
          <span className="flex items-center gap-2.5">
            <Warehouse size={17} /><span>Cadastros</span>
          </span>
          {cadastrosOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>

        {cadastrosOpen && (
          <div className="nav-subnav">
            {cadastrosItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'nav-item',
                    isActive && 'active',
                  )
                }
              >
                <Icon size={15} /><span>{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>
      <div className="sidebar-footer"><strong>Operação local</strong>Dados sincronizados hoje</div>
    </aside>
  )
}
