import { Injectable } from '@nestjs/common';
import type { PaginationParams } from '../../../common/types';
import {
  GetEntregasUseCase,
  GetEntregaByIdUseCase,
  UpdateEntregaUseCase,
  AvancarEntregaUseCase,
} from '../use-cases';
import { GetEntregasFilter } from '../repositories';
import { UpdateEntregaDto } from '../dto';
import { Entrega } from '../models';

@Injectable()
export class EntregaService {
  constructor(
    private readonly getManyUseCase: GetEntregasUseCase,
    private readonly getByIdUseCase: GetEntregaByIdUseCase,
    private readonly updateUseCase: UpdateEntregaUseCase,
    private readonly avancarUseCase: AvancarEntregaUseCase,
  ) {}

  getMany(filter: GetEntregasFilter, pagination: PaginationParams): Promise<Entrega[]> {
    return this.getManyUseCase.execute({ filter, pagination });
  }

  getById(id: string): Promise<Entrega> {
    return this.getByIdUseCase.execute(id);
  }

  update(id: string, data: UpdateEntregaDto): Promise<Entrega> {
    return this.updateUseCase.execute({ id, data });
  }

  avancar(id: string): Promise<Entrega> {
    return this.avancarUseCase.execute(id);
  }
}
