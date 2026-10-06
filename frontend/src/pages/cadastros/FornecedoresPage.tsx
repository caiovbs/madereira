import { fornecedoresApi } from '@/api/cadastros'
import { CadastroList, type FieldDef } from './CadastroList'

const fields: FieldDef[] = [
  { name: 'nome', label: 'Nome', required: true, maxLength: 150 },
  { name: 'telefone', label: 'Telefone', maxLength: 20 },
  { name: 'observacao', label: 'Observação', maxLength: 500 },
]

export function FornecedoresPage() {
  return <CadastroList title="Fornecedores" singular="fornecedor" description="Origem dos materiais e histórico de abastecimento." resource={fornecedoresApi} fields={fields}
    getRow={(f) => ({ title: f.nome, detail: [f.telefone, f.observacao].filter(Boolean).join(' · ') || 'Sem contato' })}
    summary="Os fornecedores ativos aparecem no pedido de compra e no recebimento de carga." />
}
