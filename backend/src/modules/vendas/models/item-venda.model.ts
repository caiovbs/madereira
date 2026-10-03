import { Entity } from '../../../common/classes'

export class ItemVenda extends Entity {
  vendaId: string
  produtoId: string
  quantidade: number
  precoUnit: number
  cortarParaM: number | null
  aparelhar: boolean
  subtotalLinha: number
}
