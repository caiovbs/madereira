import { Injectable } from '@nestjs/common';
import { EntregaStatus, Prisma } from '@prisma/client';
import { BaseRepositoryPrisma } from '../../../common/classes';
import type { PaginationParams } from '../../../common/types';
import { getPaginationParamsToRepository } from '../../../common/utils';
import { Entrega } from '../models';
import type { UpdateEntregaDto } from '../dto';

export interface GetEntregasFilter {
  status?: EntregaStatus;
  motoristaId?: string;
  vendaId?: string;
}

const STATUS_SEQUENCE: EntregaStatus[] = [
  EntregaStatus.a_carregar,
  EntregaStatus.carregado,
  EntregaStatus.em_rota,
  EntregaStatus.entregue,
];

export function nextEntregaStatus(current: EntregaStatus): EntregaStatus | null {
  const idx = STATUS_SEQUENCE.indexOf(current);
  return idx >= 0 && idx < STATUS_SEQUENCE.length - 1 ? STATUS_SEQUENCE[idx + 1] : null;
}

@Injectable()
export class EntregaRepository extends BaseRepositoryPrisma(Entrega, 'entrega') {
  async update(id: string, input: UpdateEntregaDto): Promise<Entrega> {
    const data: Prisma.EntregaUpdateInput = {};
    if (input.caminhaoId !== undefined)
      data.caminhao = input.caminhaoId ? { connect: { id: input.caminhaoId } } : { disconnect: true };
    if (input.motoristaId !== undefined)
      data.motorista = input.motoristaId ? { connect: { id: input.motoristaId } } : { disconnect: true };
    if (input.endereco !== undefined) data.endereco = input.endereco;
    if (input.observacao !== undefined) data.observacao = input.observacao;
    if (input.dataAgendada !== undefined) data.dataAgendada = new Date(input.dataAgendada);
    if (input.turno !== undefined) data.turno = input.turno;
    return this.format(await this.delegate.update({ where: { id }, data }));
  }

  async avancar(id: string, next: EntregaStatus): Promise<Entrega> {
    const timestamps: Prisma.EntregaUpdateInput = {};
    if (next === EntregaStatus.carregado) timestamps.carregadoEm = new Date();
    if (next === EntregaStatus.em_rota) timestamps.saiuEm = new Date();
    if (next === EntregaStatus.entregue) timestamps.entregueEm = new Date();
    return this.format(
      await this.delegate.update({ where: { id }, data: { status: next, ...timestamps } }),
    );
  }

  async getMany(filter: GetEntregasFilter, pagination: PaginationParams): Promise<Entrega[]> {
    const where: Prisma.EntregaWhereInput = {};
    if (filter.status) where.status = filter.status;
    if (filter.motoristaId) where.motoristaId = filter.motoristaId;
    if (filter.vendaId) where.vendaId = filter.vendaId;
    return this.formatMany(
      await this.delegate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...getPaginationParamsToRepository(pagination),
      }),
    );
  }
}
