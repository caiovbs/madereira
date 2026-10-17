import { useEffect, useState } from 'react'
import { Field, FormDialog } from '@/components/FormDialog'
import { formatCurrency } from '@/components/operations'
import type { FormaPagamento } from '@/api/types'

/** Pergunta forma de pagamento (e vencimento, se a prazo) antes de fechar uma venda ou receber uma compra. */
export function PagamentoDialog({ open, title, description, total, submitLabel, pending, onClose, onConfirm }: {
  open: boolean
  title: string
  description?: string
  total: number
  submitLabel: string
  pending?: boolean
  onClose: () => void
  onConfirm: (v: { formaPagamento: FormaPagamento; vencimento?: string }) => void
}) {
  const [forma, setForma] = useState<FormaPagamento>('pix')
  const [vencimento, setVencimento] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (open) { setForma('pix'); setVencimento(''); setErro('') }
  }, [open])

  const submit = () => {
    if (forma === 'prazo' && !vencimento) return setErro('Informe o vencimento para pagamento a prazo.')
    onConfirm({ formaPagamento: forma, vencimento: forma === 'prazo' ? vencimento : undefined })
  }

  return <FormDialog open={open} onOpenChange={(o) => !o && onClose()} title={title} description={description} submitLabel={submitLabel} onSubmit={submit} pending={pending}>
    <div className="summary-total" style={{ marginTop: 0 }}><span>Total</span><span>{formatCurrency(total)}</span></div>
    <Field label="Forma de pagamento">
      <select value={forma} onChange={(e) => setForma(e.target.value as FormaPagamento)}>
        <option value="pix">Pix</option><option value="dinheiro">Dinheiro</option><option value="cartao">Cartão</option><option value="prazo">A prazo</option>
      </select>
    </Field>
    {forma === 'prazo' && <Field label="Vencimento" error={erro}><input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} /></Field>}
  </FormDialog>
}
