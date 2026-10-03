import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { InicioDashboard } from '@/pages/inicio/InicioDashboard'
import { VendasPage } from '@/pages/vendas/VendasPage'
import { EstoquePage } from '@/pages/estoque/EstoquePage'
import { ComprasPage } from '@/pages/compras/ComprasPage'
import { PatioPage } from '@/pages/patio/PatioPage'
import { EntregasPage } from '@/pages/entregas/EntregasPage'
import { FinanceiroPage } from '@/pages/financeiro/FinanceiroPage'
import { ClientesPage } from '@/pages/cadastros/ClientesPage'
import { FornecedoresPage } from '@/pages/cadastros/FornecedoresPage'
import { FuncionariosPage } from '@/pages/cadastros/FuncionariosPage'
import { CaminhoesPage } from '@/pages/cadastros/CaminhoesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <InicioDashboard /> },
      { path: 'vendas', element: <VendasPage /> },
      { path: 'estoque', element: <EstoquePage /> },
      { path: 'compras', element: <ComprasPage /> },
      { path: 'patio', element: <PatioPage /> },
      { path: 'entregas', element: <EntregasPage /> },
      { path: 'financeiro', element: <FinanceiroPage /> },
      { path: 'cadastros/clientes', element: <ClientesPage /> },
      { path: 'cadastros/fornecedores', element: <FornecedoresPage /> },
      { path: 'cadastros/funcionarios', element: <FuncionariosPage /> },
      { path: 'cadastros/caminhoes', element: <CaminhoesPage /> },
    ],
  },
])
