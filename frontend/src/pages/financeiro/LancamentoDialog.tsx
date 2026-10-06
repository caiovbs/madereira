import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Field, FormDialog } from '@/components/FormDialog'
import { useCriarLancamento } from '@/api/operacoes'
import type { LancCategoria, LancSentido } from '@/api/types'

type Values = { sentido: LancSentido; descricao: string; categoria: LancCategoria | ''; valor: number; vencimento: string; jaRealizado: boolean }

/** Lançamento avulso (combustível, salário, luz...). Por padrão já entra como pago/recebido no caixa. */
export function LancamentoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const criar = useCriarLancamento()
  const form = useForm<Values>()
  const errors = form.formState.errors
  const jaRealizado = form.watch('jaRealizado')

  useEffect(() => {
    if (open) form.reset({ sentido: 'saida', descricao: '', categoria: '', valor: undefined, vencimento: '', jaRealizado: true })
  }, [open, form])

  const submit = form.handleSubmit((v) => {
    criar.mutate({
      sentido: v.sentido,
      descricao: v.descricao.trim(),
      categoria: v.categoria || undefined,
      valor: v.valor,
      vencimento: v.jaRealizado ? undefined : v.vencimento || undefined,
      jaRealizado: v.jaRealizado,
    }, { onSuccess: onClose })
  })

  return <FormDialog open={open} onOpenChange={(o) => !o && onClose()} title="Novo lançamento" description="Despesas ou entradas avulsas que não vêm de uma venda ou compra." onSubmit={submit} pending={criar.isPending}>
    <div className="form-row">
      <Field label="Tipo"><select {...form.register('sentido')}><option value="saida">Saída (despesa)</option><option value="entrada">Entrada</option></select></Field>
      <Field label="Categoria"><select {...form.register('categoria')}><option value="">—</option><option value="combustivel">Combustível</option><option value="salario">Salário</option><option value="energia">Energia</option><option value="manutencao">Manutenção</option><option value="outro">Outro</option></select></Field>
    </div>
    <Field label="Descrição" error={errors.descricao?.message}><input maxLength={255} {...form.register('descricao', { required: 'Obrigatório', validate: (v) => v.trim().length > 0 || 'Obrigatório' })} /></Field>
    <div className="form-row">
      <Field label="Valor (R$)" error={errors.valor?.message}><input type="number" step="0.01" {...form.register('valor', { valueAsNumber: true, required: 'Obrigatório', validate: (v) => v > 0 || 'Deve ser maior que zero' })} /></Field>
      {!jaRealizado && <Field label="Vencimento"><input type="date" {...form.register('vencimento')} /></Field>}
    </div>
    <label className="check-option" style={{ width: 'fit-content' }}><input type="checkbox" {...form.register('jaRealizado')} /> Já pago/recebido (lança direto no caixa)</label>
  </FormDialog>
}
