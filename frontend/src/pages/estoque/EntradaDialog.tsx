import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Field, FormDialog } from '@/components/FormDialog'
import { fornecedoresApi } from '@/api/cadastros'
import { useEntradaRapida } from '@/api/produtos'
import type { FormaPagamento, Produto } from '@/api/types'

type Values = {
  quantidade: number
  custoUnit: number
  fornecedorId: string
  formaPagamento: FormaPagamento
  vencimento: string
}

export function EntradaDialog({ produto, onClose }: { produto: Produto | null; onClose: () => void }) {
  const fornecedores = fornecedoresApi.useList({ ativo: true })
  const entrada = useEntradaRapida()
  const form = useForm<Values>()
  const errors = form.formState.errors
  const forma = form.watch('formaPagamento')

  useEffect(() => {
    if (produto) form.reset({ quantidade: undefined, custoUnit: produto.custo || undefined, fornecedorId: '', formaPagamento: 'dinheiro', vencimento: '' })
  }, [produto, form])

  const submit = form.handleSubmit((v) => {
    if (!produto) return
    entrada.mutate({
      compra: { fornecedorId: v.fornecedorId || undefined, itens: [{ produtoId: produto.id, quantidade: v.quantidade, custoUnit: v.custoUnit }] },
      pagamento: { formaPagamento: v.formaPagamento, vencimento: v.formaPagamento === 'prazo' ? v.vencimento : undefined },
    }, { onSuccess: onClose })
  })

  return <FormDialog open={produto !== null} onOpenChange={(o) => !o && onClose()} title="Entrada de estoque" description={produto ? `${produto.nome} · saldo atual ${produto.qtdAtual}` : undefined} submitLabel="Registrar entrada" onSubmit={submit} pending={entrada.isPending}>
    <div className="form-row">
      <Field label="Quantidade (peças)" error={errors.quantidade?.message}><input type="number" step="1" autoFocus {...form.register('quantidade', { valueAsNumber: true, required: 'Obrigatório', validate: (v) => (Number.isInteger(v) && v > 0) || 'Informe um inteiro maior que zero' })} /></Field>
      <Field label="Custo unitário (R$)" error={errors.custoUnit?.message}><input type="number" step="0.01" {...form.register('custoUnit', { valueAsNumber: true, required: 'Obrigatório', validate: (v) => v > 0 || 'Deve ser maior que zero' })} /></Field>
    </div>
    <Field label="Fornecedor (opcional)"><select {...form.register('fornecedorId')}><option value="">—</option>{fornecedores.data?.map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}</select></Field>
    <div className="form-row">
      <Field label="Pagamento"><select {...form.register('formaPagamento')}><option value="dinheiro">Dinheiro</option><option value="pix">Pix</option><option value="cartao">Cartão</option><option value="prazo">A prazo</option></select></Field>
      {forma === 'prazo' && <Field label="Vencimento" error={errors.vencimento?.message}><input type="date" {...form.register('vencimento', { required: 'Obrigatório para compra a prazo' })} /></Field>}
    </div>
  </FormDialog>
}
