import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Field, FormDialog } from '@/components/FormDialog'
import { tiposMadeiraApi } from '@/api/cadastros'
import { produtosApi } from '@/api/produtos'
import type { EstadoMadeira, Produto } from '@/api/types'

type Values = {
  tipoId: string
  estado: EstadoMadeira
  espessuraCm: number
  larguraCm: number
  comprimentoEstoqueM: number
  custo: number
  preco: number
  estoqueMinimo: number
}

const num = { valueAsNumber: true, required: 'Obrigatório', min: { value: 0, message: 'Não pode ser negativo' } }
const positive = { valueAsNumber: true, required: 'Obrigatório', validate: (v: number) => v > 0 || 'Deve ser maior que zero' }

export function ProdutoDialog({ produto, onClose }: { produto: Produto | 'new' | null; onClose: () => void }) {
  const tipos = tiposMadeiraApi.useList({ ativo: true })
  const createTipo = tiposMadeiraApi.useCreate()
  const create = produtosApi.useCreate()
  const update = produtosApi.useUpdate()
  const [novoTipo, setNovoTipo] = useState<string | null>(null)
  const form = useForm<Values>()
  const errors = form.formState.errors

  useEffect(() => {
    if (!produto) return
    setNovoTipo(null)
    const p = produto === 'new' ? null : produto
    form.reset({
      tipoId: p?.tipoId ?? '',
      estado: p?.estado ?? 'bruta',
      espessuraCm: p?.espessuraCm,
      larguraCm: p?.larguraCm,
      comprimentoEstoqueM: p?.comprimentoEstoqueM ?? 3,
      custo: p?.custo ?? 0,
      preco: p?.preco,
      estoqueMinimo: p?.estoqueMinimo ?? 0,
    })
  }, [produto, form])

  const submit = form.handleSubmit((values) => {
    const done = { onSuccess: onClose }
    if (produto === 'new') create.mutate(values, done)
    else if (produto) update.mutate({ id: produto.id, data: values }, done)
  })

  const addTipo = () => {
    const nome = (novoTipo ?? '').trim()
    if (nome.length < 2) return
    createTipo.mutate({ nome }, { onSuccess: (tipo) => { form.setValue('tipoId', tipo.id); setNovoTipo(null) } })
  }

  return <FormDialog open={produto !== null} onOpenChange={(o) => !o && onClose()} title={produto === 'new' ? 'Novo produto' : 'Editar produto'} description="O nome é gerado automaticamente a partir do tipo, estado e medidas." onSubmit={submit} pending={create.isPending || update.isPending}>
    <div className="form-row">
      <Field label="Tipo / espécie" error={errors.tipoId?.message}>
        {novoTipo === null
          ? <select {...form.register('tipoId', { required: 'Selecione um tipo' })}><option value="">Selecione…</option>{tipos.data?.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}</select>
          : <input autoFocus placeholder="Nome do novo tipo" value={novoTipo} onChange={(e) => setNovoTipo(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTipo() } }} />}
        {novoTipo === null
          ? <button className="section-link" type="button" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left' }} onClick={() => setNovoTipo('')}>+ novo tipo</button>
          : <span className="page-actions" style={{ justifyContent: 'flex-start' }}><button className="button button-secondary" type="button" onClick={addTipo} disabled={createTipo.isPending}>Adicionar</button><button className="button button-ghost" type="button" onClick={() => setNovoTipo(null)}>Cancelar</button></span>}
      </Field>
      <Field label="Estado"><select {...form.register('estado')}><option value="bruta">Bruta</option><option value="aparelhada">Aparelhada</option></select></Field>
    </div>
    <div className="form-row">
      <Field label="Espessura (cm)" error={errors.espessuraCm?.message}><input type="number" step="any" {...form.register('espessuraCm', positive)} /></Field>
      <Field label="Largura (cm)" error={errors.larguraCm?.message}><input type="number" step="any" {...form.register('larguraCm', positive)} /></Field>
      <Field label="Comprimento (m)" error={errors.comprimentoEstoqueM?.message}><input type="number" step="any" {...form.register('comprimentoEstoqueM', positive)} /></Field>
    </div>
    <div className="form-row">
      <Field label="Custo (R$)" error={errors.custo?.message}><input type="number" step="0.01" {...form.register('custo', num)} /></Field>
      <Field label="Preço de venda (R$)" error={errors.preco?.message}><input type="number" step="0.01" {...form.register('preco', num)} /></Field>
      <Field label="Estoque mínimo" error={errors.estoqueMinimo?.message}><input type="number" step="1" {...form.register('estoqueMinimo', num)} /></Field>
    </div>
  </FormDialog>
}
