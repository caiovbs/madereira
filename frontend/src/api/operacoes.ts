import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, extractData } from '@/lib/api'
import type { ListParams } from './resource'
import type {
  Caixa, Compra, Entrega, EntregaInput, Lancamento, LancamentoAvulsoInput, RotaDoDia, TarefaPatio, Venda, VendaInput,
} from './models'
import type { CompraInput, ReceberCompraInput } from './types'

function clean(params?: ListParams) {
  if (!params) return undefined
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
}

function useGet<T>(root: string, path: string, params?: ListParams, enabled = true) {
  return useQuery({
    queryKey: [root, path, params ?? {}],
    enabled,
    queryFn: async () => extractData<T>(await api.get(path, { params: clean(params) })),
  })
}

/** Mutation que invalida as consultas dos módulos afetados pela cascata. */
function useAction<TVars, TRes>(fn: (vars: TVars) => Promise<TRes>, roots: string[], message?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      roots.forEach((root) => qc.invalidateQueries({ queryKey: [root] }))
      if (message) toast.success(message)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

const post = async <T>(path: string, body?: unknown) => extractData<T>(await api.post(path, body))
const axiosPut = async <T>(path: string, body: unknown) => extractData<T>(await api.put(path, body))
const patch = async <T>(path: string, body: unknown) => extractData<T>(await api.patch(path, body))

// ── Vendas ───────────────────────────────────────────────────────────────
export const useVendas = (params?: ListParams) => useGet<Venda[]>('vendas', '/vendas', { pageSize: 500, ...params })
export const useVenda = (id?: string) => useGet<Venda>('vendas', `/vendas/${id}`, undefined, !!id)

const VENDA_CASCATA = ['vendas', 'produtos', 'patio', 'entregas', 'financeiro']
export const useSalvarVenda = () =>
  useAction(({ id, data }: { id?: string; data: VendaInput }) => (id ? patch<Venda>(`/vendas/${id}`, data) : post<Venda>('/vendas', data)), ['vendas'])
export const useFecharVenda = () =>
  useAction(({ id, ...body }: { id: string; formaPagamento: string; vencimento?: string }) => post<Venda>(`/vendas/${id}/fechar`, body), VENDA_CASCATA, 'Venda fechada.')
export const useCancelarVenda = () =>
  useAction((id: string) => post<Venda>(`/vendas/${id}/cancelar`), ['vendas'], 'Orçamento cancelado.')

// ── Compras ──────────────────────────────────────────────────────────────
export const useCompras = (params?: ListParams) => useGet<Compra[]>('compras', '/compras', { pageSize: 500, ...params })

export const useSalvarCompra = () =>
  useAction(({ id, data }: { id?: string; data: CompraInput }) => (id ? patch<Compra>(`/compras/${id}`, data) : post<Compra>('/compras', data)), ['compras'], 'Pedido salvo.')
export const useReceberCompra = () =>
  useAction(({ id, ...body }: { id: string } & ReceberCompraInput) => post<Compra>(`/compras/${id}/receber`, body), ['compras', 'produtos', 'financeiro'], 'Compra recebida: estoque e financeiro atualizados.')
export const useCancelarCompra = () =>
  useAction((id: string) => post<Compra>(`/compras/${id}/cancelar`), ['compras'], 'Pedido cancelado.')

// ── Pátio ────────────────────────────────────────────────────────────────
export const useTarefas = (params?: ListParams) => useGet<TarefaPatio[]>('patio', '/patio/tarefas', params)
export const useConcluirTarefa = () =>
  useAction((id: string) => post<TarefaPatio>(`/patio/tarefas/${id}/concluir`), ['patio', 'entregas'], 'Tarefa concluída.')

// ── Entregas ─────────────────────────────────────────────────────────────
export const useEntregas = (params?: ListParams) => useGet<Entrega[]>('entregas', '/entregas', { pageSize: 500, ...params })
export const useUpdateEntrega = () =>
  useAction(({ id, data }: { id: string; data: EntregaInput }) => patch<Entrega>(`/entregas/${id}`, data), ['entregas'], 'Entrega atualizada.')
/** Rota do dia: pontos, ordem e traçado. `otimizar` ignora a ordem salva e sugere uma nova (sem gravar). */
export const useRota = (params: { data: string; caminhaoId?: string; saida?: string; otimizar?: boolean }) =>
  useGet<RotaDoDia>('entregas', '/entregas/rota', { ...params, otimizar: params.otimizar ? 'true' : undefined }, !!params.data)
export const useSalvarOrdemRota = () =>
  useAction((ids: string[]) => axiosPut<{ salvas: number }>('/entregas/rota/ordem', { ids }), ['entregas'])

export const useAvancarEntrega = () =>
  useAction((id: string) => post<Entrega>(`/entregas/${id}/avancar`), ['entregas'])

// ── Financeiro ───────────────────────────────────────────────────────────
export const useCaixa = () => useGet<Caixa>('financeiro', '/financeiro/caixa')
export const useLancamentos = (params?: ListParams) =>
  useGet<Lancamento[]>('financeiro', '/financeiro/lancamentos', { pageSize: 500, ...params })
export const useRealizarLancamento = () =>
  useAction((id: string) => post<Lancamento>(`/financeiro/lancamentos/${id}/realizar`), ['financeiro'], 'Baixa registrada.')
export const useCriarLancamento = () =>
  useAction(async ({ jaRealizado, ...data }: LancamentoAvulsoInput & { jaRealizado: boolean }) => {
    const lanc = await post<Lancamento>('/financeiro/lancamentos', data)
    return jaRealizado ? post<Lancamento>(`/financeiro/lancamentos/${lanc.id}/realizar`) : lanc
  }, ['financeiro'], 'Lançamento registrado.')
