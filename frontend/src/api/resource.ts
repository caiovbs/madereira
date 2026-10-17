import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, extractData } from '@/lib/api'

export type ListParams = Record<string, string | number | boolean | undefined>

/** Remove chaves vazias para não enviar `?search=` ao backend. */
function cleanParams(params?: ListParams) {
  if (!params) return undefined
  return Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
}

/** Contrato mínimo que as telas de cadastro esperam de um recurso (a entrada é validada pelo form). */
export interface CrudResource<T> {
  useList(params?: ListParams): UseQueryResult<T[], Error>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useCreate(): UseMutationResult<T, Error, any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useUpdate(): UseMutationResult<T, Error, { id: string; data: any }>
}

/**
 * Gera hooks de listagem/criação/edição para um recurso REST simples
 * (GET /path, POST /path, PATCH /path/:id) com envelope { status, data }.
 */
export function createResource<T extends { id: string }, TInput>(path: string, label: string) {
  const key = [path]

  function useList(params?: ListParams) {
    return useQuery({
      queryKey: [...key, params ?? {}],
      queryFn: async () => extractData<T[]>(await api.get(`/${path}`, { params: cleanParams(params) })),
    })
  }

  function useCreate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async (input: TInput) => extractData<T>(await api.post(`/${path}`, input)),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: key })
        toast.success(`${label} cadastrado.`)
      },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  function useUpdate() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Partial<TInput> & { ativo?: boolean } }) =>
        extractData<T>(await api.patch(`/${path}/${id}`, data)),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: key })
        toast.success(`${label} atualizado.`)
      },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return { useList, useCreate, useUpdate }
}
