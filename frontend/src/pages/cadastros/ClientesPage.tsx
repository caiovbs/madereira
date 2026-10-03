import { CadastroList } from './CadastroList'

export function ClientesPage() {
  return <CadastroList title="Clientes" singular="cliente" description="Pessoas e empresas disponíveis para novas vendas." rows={[
    { title: 'João Silva', detail: '(11) 99872-4451 · Rua das Palmeiras, 100' },
    { title: 'Construtora Horizonte', detail: '(11) 3244-1180 · Av. Industrial, 820' },
    { title: 'Maria Oliveira', detail: '(11) 99122-3009 · Estrada do Campo, km 4' },
    { title: 'Oficina Matos', detail: '(11) 3118-7310 · Rua das Oficinas, 45', status: 'Inativo' },
  ]} summary={<><h2>Carteira de clientes</h2><p>Dados de contato e endereço ficam disponíveis ao iniciar uma nova venda.</p><dl><div><dt>Clientes ativos</dt><dd>128</dd></div><div><dt>Com compra no mês</dt><dd>37</dd></div><div><dt>Novos este mês</dt><dd>9</dd></div></dl></>} />
}
