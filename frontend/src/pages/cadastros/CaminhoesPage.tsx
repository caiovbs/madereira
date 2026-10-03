import { CadastroList } from './CadastroList'

export function CaminhoesPage() {
  return <CadastroList title="Caminhões" singular="caminhão" description="Veículos disponíveis para carregar e executar entregas." rows={[
    { title: 'Caminhão A', detail: 'ABC-1D23 · 12 t · Em rota', tags: ['12 t'] },
    { title: 'Caminhão B', detail: 'DEF-4G56 · 8 t · Disponível', tags: ['8 t'] },
    { title: 'Caminhão C', detail: 'HIJ-7K89 · 5 t · No pátio', tags: ['5 t'] },
    { title: 'Caminhão reserva', detail: 'KLM-0N12 · Em manutenção', tags: ['Reserva'], status: 'Inativo' },
  ]} summary={<><h2>Frota</h2><p>Veículos ativos ficam disponíveis na atribuição de entregas e na montagem de rota.</p><dl><div><dt>Veículos ativos</dt><dd>3</dd></div><div><dt>Em rota agora</dt><dd>1</dd></div><div><dt>Capacidade total</dt><dd>25 t</dd></div></dl></>} />
}
