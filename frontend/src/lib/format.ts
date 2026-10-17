import type { EntregaStatus, FormaPagamento, Turno } from '@/api/types'

export const FORMA_LABEL: Record<FormaPagamento, string> = { dinheiro: 'Dinheiro', pix: 'Pix', cartao: 'Cartão', prazo: 'A prazo' }
export const TURNO_LABEL: Record<Turno, string> = { manha: 'Manhã', tarde: 'Tarde' }
export const ENTREGA_LABEL: Record<EntregaStatus, string> = { a_carregar: 'A carregar', carregado: 'Carregado', em_rota: 'Em rota', entregue: 'Entregue', cancelada: 'Cancelada' }

/**
 * Campos só-data (vencimento, dataAgendada) chegam como `YYYY-MM-DDT00:00:00.000Z`.
 * Lidos como instante, apareceriam no dia anterior em UTC−3; aqui viram a data local equivalente.
 */
function toDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T00:00:00(?:\.000)?Z$/.exec(iso)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(iso)
}

export function formatDate(iso?: string | null) {
  if (!iso) return '—'
  return toDate(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
}

export function formatTime(iso?: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/** Compara apenas a data (ignora horário) no fuso local. */
export function isSameDay(iso: string | null | undefined, ref = new Date()) {
  if (!iso) return false
  const d = toDate(iso)
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate()
}

export function isOverdue(iso?: string | null) {
  if (!iso) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return toDate(iso) < today
}

/** Dia local a partir de uma data só-data, para comparações com Date (ex.: janela de 7 dias). */
export function dayOf(iso: string) {
  return toDate(iso)
}

/** Normaliza para busca: minúsculas e sem acento. */
export function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}
