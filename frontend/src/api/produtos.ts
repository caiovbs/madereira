import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, extractData } from '@/lib/api'
import { createResource } from './resource'
import type { CompraInput, Produto, ProdutoInput, ReceberCompraInput } from './types'

export const produtosApi = createResource<Produto, ProdutoInput>('produtos', 'Produto')

/**
 * Entrada rápida de estoque: cria uma compra de 1 item e já a marca como recebida,
 * assim todo movimento de estoque tem uma compra de origem (ver docs/design.md 3.3).
 */
export function useEntradaRapida() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { compra: CompraInput; pagamento: ReceberCompraInput }) => {
      const compra = extractData<{ id: string }>(await api.post('/compras', input.compra))
      return extractData(await api.post(`/compras/${compra.id}/receber`, input.pagamento))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['produtos'] })
      qc.invalidateQueries({ queryKey: ['compras'] })
      qc.invalidateQueries({ queryKey: ['financeiro'] })
      toast.success('Entrada registrada.')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
