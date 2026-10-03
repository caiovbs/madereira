import { Entity } from '../../../../common/classes';

export class Cliente extends Entity {
  nome: string;
  telefone: string | null;
  endereco: string | null;
  documento: string | null;
  ativo: boolean;
}
