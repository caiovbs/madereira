import { caminhoesApi } from '@/api/cadastros'
import { CadastroList, type FieldDef } from './CadastroList'

const fields: FieldDef[] = [
  { name: 'descricao', label: 'Descrição', required: true, maxLength: 100 },
  { name: 'placa', label: 'Placa', maxLength: 10 },
]

export function CaminhoesPage() {
  return <CadastroList title="Caminhões" singular="caminhão" description="Veículos disponíveis para carregar e executar entregas." resource={caminhoesApi} fields={fields}
    getRow={(c) => ({ title: c.descricao, detail: c.placa ?? 'Sem placa' })}
    summary="Veículos ativos ficam disponíveis na atribuição de entregas." />
}
