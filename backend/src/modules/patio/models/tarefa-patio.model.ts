import type { TarefaStatus, TarefaTipo } from '@prisma/client';
import { Entity } from '../../../common/classes';

export class TarefaPatio extends Entity {
  vendaId: string;
  itemVendaId: string | null;
  tipo: TarefaTipo;
  status: TarefaStatus;
  corteConcluido: boolean;
  aparelhoConcluido: boolean;
  concluidaEm: Date | null;
}
