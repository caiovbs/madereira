import type { EntregaStatus, Turno } from '@prisma/client';
import { Entity } from '../../../common/classes';

export class Entrega extends Entity {
  vendaId: string;
  status: EntregaStatus;
  caminhaoId: string | null;
  motoristaId: string | null;
  endereco: string | null;
  observacao: string | null;
  dataAgendada: Date | null;
  turno: Turno | null;
  carregadoEm: Date | null;
  saiuEm: Date | null;
  entregueEm: Date | null;
}
