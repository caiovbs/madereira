import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = !err.response
      ? 'Não foi possível conectar à API.'
      : err.response.data?.message ?? err.response.data?.errorMessage ?? 'Erro inesperado.'
    return Promise.reject(new Error(message))
  },
)

export function extractData<T>(res: { data: { data: T } }): T {
  return res.data.data
}
