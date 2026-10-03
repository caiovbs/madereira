import { Entity } from '../../../common/classes';

export class ItemCompra extends Entity {
  compraId: string;
  produtoId: string;
  quantidade: number;
  custoUnit: number;
  subtotalLinha: number;
}
