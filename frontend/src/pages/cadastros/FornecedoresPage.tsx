import { CadastroList } from './CadastroList'

export function FornecedoresPage() {
  return <CadastroList title="Fornecedores" singular="fornecedor" description="Origem dos materiais e histórico de abastecimento." rows={[
    { title: 'Serraria São José', detail: '(11) 3881-4470 · Pinus e eucalipto' },
    { title: 'Madeireira Central', detail: '(11) 3331-2810 · Tábuas aparelhadas' },
    { title: 'Florestal Campo Verde', detail: '(11) 3129-1020 · Eucalipto tratado' },
    { title: 'Ferragens do Vale', detail: '(11) 3220-0097 · Materiais complementares', status: 'Inativo' },
  ]} summary={<><h2>Base de compras</h2><p>Os fornecedores ativos aparecem no pedido de compra e no recebimento de carga.</p><dl><div><dt>Fornecedores ativos</dt><dd>18</dd></div><div><dt>Compras no mês</dt><dd>12</dd></div><div><dt>Maior volume</dt><dd>Serraria São José</dd></div></dl></>} />
}
