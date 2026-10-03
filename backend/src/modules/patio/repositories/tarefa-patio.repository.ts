import { Injectable } from '@nestjs/common';
import { Prisma, TarefaStatus, TarefaTipo } from '@prisma/client';
import { BaseRepositoryPrisma } from '../../../common/classes';
import { TarefaPatio } from '../models';

export interface GetTarefasFilter {
  status?: TarefaStatus;
  tipo?: TarefaTipo;
  vendaId?: string;
}

@Injectable()
export class TarefaPatioRepository extends BaseRepositoryPrisma(TarefaPatio, 'tarefaPatio') {
  async getMany(filter: GetTarefasFilter): Promise<TarefaPatio[]> {
    const where: Prisma.TarefaPatioWhereInput = {};
    if (filter.status) where.status = filter.status;
    if (filter.tipo) where.tipo = filter.tipo;
    if (filter.vendaId) where.vendaId = filter.vendaId;
    return this.formatMany(
      await this.delegate.findMany({ where, orderBy: { createdAt: 'asc' } }),
    );
  }

  async concluir(id: string): Promise<TarefaPatio> {
    return this.format(
      await this.delegate.update({
        where: { id },
        data: {
          status: TarefaStatus.concluida,
          corteConcluido: true,
          aparelhoConcluido: true,
          concluidaEm: new Date(),
        },
      }),
    );
  }
}
