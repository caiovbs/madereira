import { Entity } from '../../../../common/classes';

export class Caminhao extends Entity {
  descricao: string;
  placa: string | null;
  ativo: boolean;
}
