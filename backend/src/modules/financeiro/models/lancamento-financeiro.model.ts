import type { LancCategoria, LancOrigem, LancSentido, LancSituacao } from '@prisma/client';
import { Entity } from '../../../common/classes';

export class LancamentoFinanceiro extends Entity {
  sentido: LancSentido;
  situacao: LancSituacao;
  origemTipo: LancOrigem;
  vendaId: string | null;
  compraId: string | null;
  descricao: string;
  categoria: LancCategoria | null;
  valor: number;
  vencimento: Date | null;
  dataRealizado: Date | null;
}
