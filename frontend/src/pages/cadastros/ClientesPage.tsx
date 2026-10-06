import { clientesApi } from '@/api/cadastros'
import { CadastroList, type FieldDef } from './CadastroList'

const fields: FieldDef[] = [
  { name: 'nome', label: 'Nome', required: true, maxLength: 150 },
  { name: 'telefone', label: 'Telefone', maxLength: 20 },
  { name: 'endereco', label: 'Endereço', maxLength: 255 },
  { name: 'documento', label: 'CPF/CNPJ', maxLength: 30 },
]

export function ClientesPage() {
  return <CadastroList title="Clientes" singular="cliente" description="Pessoas e empresas disponíveis para novas vendas." resource={clientesApi} fields={fields}
    getRow={(c) => ({ title: c.nome, detail: [c.telefone, c.endereco].filter(Boolean).join(' · ') || 'Sem contato' })}
    summary="Dados de contato e endereço ficam disponíveis ao iniciar uma nova venda." />
}
