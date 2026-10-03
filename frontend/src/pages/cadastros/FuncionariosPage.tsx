import { CadastroList } from './CadastroList'

export function FuncionariosPage() {
  return <CadastroList title="Funcionários" singular="funcionário" description="Equipe do pátio e motoristas disponíveis para a operação." rows={[
    { title: 'José Ferreira', detail: '(11) 99730-2145', tags: ['Motorista', 'Cortador'] },
    { title: 'Bruno Costa', detail: '(11) 99162-4840', tags: ['Motorista'] },
    { title: 'Pedro Alves', detail: '(11) 99309-1811', tags: ['Carregador'] },
    { title: 'Antônio Souza', detail: '(11) 99931-5420', tags: ['Aparelhador', 'Cortador'] },
  ]} summary={<><h2>Equipe operacional</h2><p>As funções definem em quais filas e seletores cada pessoa aparece.</p><dl><div><dt>Funcionários ativos</dt><dd>14</dd></div><div><dt>Motoristas habilitados</dt><dd>3</dd></div><div><dt>No pátio hoje</dt><dd>8</dd></div></dl></>} />
}
