import { useMemo } from 'react'
import { clientesApi, fornecedoresApi, caminhoesApi, funcionariosApi } from './cadastros'
import { produtosApi } from './produtos'

const ALL = { pageSize: 1000 }

/** Listas completas indexadas por id, para cruzar nomes em telas que só recebem ids da API. */
function useMap<T extends { id: string }>(items?: T[]) {
  return useMemo(() => new Map((items ?? []).map((i) => [i.id, i])), [items])
}

export const useProdutoMap = () => useMap(produtosApi.useList(ALL).data)
export const useClienteMap = () => useMap(clientesApi.useList(ALL).data)
export const useFornecedorMap = () => useMap(fornecedoresApi.useList(ALL).data)
export const useCaminhaoMap = () => useMap(caminhoesApi.useList(ALL).data)
export const useFuncionarioMap = () => useMap(funcionariosApi.useList(ALL).data)
