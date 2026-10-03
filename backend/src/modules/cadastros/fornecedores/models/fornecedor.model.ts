import { Entity } from '../../../../common/classes';

export class Fornecedor extends Entity {
  nome: string;
  telefone: string | null;
  observacao: string | null;
  ativo: boolean;
}
