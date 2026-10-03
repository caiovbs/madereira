import { Injectable } from '@nestjs/common';
import { EntregaStatus } from '@prisma/client';
import { IUseCase } from '../../../../common/types';
import { BusinessRuleError, ObjectNotFoundError } from '../../../../common/errors';
import { PrismaService } from '../../../../prisma/prisma.service';
import { EntregaRepository, nextEntregaStatus } from '../../repositories';
import { Entrega } from '../../models';

@Injectable()
export class AvancarEntregaUseCase implements IUseCase<string, Entrega> {
  constructor(
    private readonly repo: EntregaRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(id: string): Promise<Entrega> {
    const entrega = await this.repo.getById(id);
    if (!entrega) throw new ObjectNotFoundError({ objectType: 'Entrega', field: 'id' });

    if (entrega.status === EntregaStatus.entregue) {
      throw new BusinessRuleError('Entrega já foi concluída.');
    }
    if (entrega.status === EntregaStatus.cancelada) {
      throw new BusinessRuleError('Entrega está cancelada.');
    }

    // Trava do pátio: só libera para carregar quando todas as tarefas estão concluídas
    if (entrega.status === EntregaStatus.a_carregar) {
      const pendentes = await this.prismaService.tarefaPatio.count({
        where: { vendaId: entrega.vendaId, status: 'pendente' },
      });
      if (pendentes > 0) {
        throw new BusinessRuleError(
          `Existem ${pendentes} tarefa(s) de pátio pendente(s). Conclua-as antes de carregar.`,
          { tarefasPendentes: pendentes },
        );
      }
    }

    const next = nextEntregaStatus(entrega.status);
    if (!next) throw new BusinessRuleError('Não é possível avançar o status desta entrega.');
    return this.repo.avancar(id, next);
  }
}
