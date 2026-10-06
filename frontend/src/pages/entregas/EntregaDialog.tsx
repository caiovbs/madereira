import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Field, FormDialog } from '@/components/FormDialog'
import { caminhoesApi, funcionariosApi } from '@/api/cadastros'
import { useUpdateEntrega } from '@/api/operacoes'
import type { Entrega } from '@/api/models'
import type { Turno } from '@/api/types'

type Values = { caminhaoId: string; motoristaId: string; endereco: string; observacao: string; dataAgendada: string; turno: Turno | '' }

/** Atribui caminhão/motorista e agenda a entrega (data + turno). */
export function EntregaDialog({ entrega, enderecoPadrao, titulo, onClose }: { entrega: Entrega | null; enderecoPadrao?: string; titulo: string; onClose: () => void }) {
  const caminhoes = caminhoesApi.useList({ ativo: true, pageSize: 1000 })
  const motoristas = funcionariosApi.useList({ ativo: true, funcao: 'motorista', pageSize: 1000 })
  const update = useUpdateEntrega()
  const form = useForm<Values>()

  useEffect(() => {
    if (!entrega) return
    form.reset({
      caminhaoId: entrega.caminhaoId ?? '',
      motoristaId: entrega.motoristaId ?? '',
      endereco: entrega.endereco ?? enderecoPadrao ?? '',
      observacao: entrega.observacao ?? '',
      dataAgendada: entrega.dataAgendada ? entrega.dataAgendada.slice(0, 10) : '',
      turno: entrega.turno ?? '',
    })
  }, [entrega, enderecoPadrao, form])

  const submit = form.handleSubmit((v) => {
    if (!entrega) return
    update.mutate({
      id: entrega.id,
      data: {
        caminhaoId: v.caminhaoId || null,
        motoristaId: v.motoristaId || null,
        endereco: v.endereco.trim() || undefined,
        observacao: v.observacao.trim() || undefined,
        dataAgendada: v.dataAgendada || undefined,
        turno: v.turno || undefined,
      },
    }, { onSuccess: onClose })
  })

  return <FormDialog open={entrega !== null} onOpenChange={(o) => !o && onClose()} title="Programar entrega" description={titulo} onSubmit={submit} pending={update.isPending}>
    <div className="form-row">
      <Field label="Caminhão"><select {...form.register('caminhaoId')}><option value="">—</option>{caminhoes.data?.map((c) => <option key={c.id} value={c.id}>{c.descricao}{c.placa ? ` · ${c.placa}` : ''}</option>)}</select></Field>
      <Field label="Motorista"><select {...form.register('motoristaId')}><option value="">—</option>{motoristas.data?.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}</select></Field>
    </div>
    <Field label="Endereço de entrega"><input maxLength={255} {...form.register('endereco')} /></Field>
    <div className="form-row">
      <Field label="Data"><input type="date" {...form.register('dataAgendada')} /></Field>
      <Field label="Turno"><select {...form.register('turno')}><option value="">—</option><option value="manha">Manhã</option><option value="tarde">Tarde</option></select></Field>
    </div>
    <Field label="Observação"><input maxLength={500} {...form.register('observacao')} /></Field>
  </FormDialog>
}
