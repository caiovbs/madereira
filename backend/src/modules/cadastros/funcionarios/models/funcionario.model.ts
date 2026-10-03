import type { Funcao } from '@prisma/client';
import { Entity } from '../../../../common/classes';

export class Funcionario extends Entity {
  nome: string;
  funcoes: Funcao[];
  telefone: string | null;
  ativo: boolean;
}
