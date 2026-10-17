import { funcionariosApi } from '@/api/cadastros'
import type { Funcao } from '@/api/types'
import { CadastroList, type FieldDef } from './CadastroList'

const FUNCOES: { value: Funcao; label: string }[] = [
  { value: 'aparelhador', label: 'Aparelhador' },
  { value: 'cortador', label: 'Cortador' },
  { value: 'carregador', label: 'Carregador' },
  { value: 'motorista', label: 'Motorista' },
]

const fields: FieldDef[] = [
  { name: 'nome', label: 'Nome', required: true, maxLength: 150 },
  { name: 'funcoes', label: 'Funções', kind: 'multi', options: FUNCOES },
  { name: 'telefone', label: 'Telefone', maxLength: 20 },
]

export function FuncionariosPage() {
  return <CadastroList title="Funcionários" singular="funcionário" description="Equipe do pátio e motoristas disponíveis para a operação." resource={funcionariosApi} fields={fields}
    getRow={(f) => ({ title: f.nome, detail: f.telefone ?? 'Sem telefone', tags: f.funcoes.map((fn) => FUNCOES.find((x) => x.value === fn)?.label ?? fn) })}
    summary="As funções definem em quais filas e seletores cada pessoa aparece." />
}
