import { Injectable } from '@nestjs/common';
import type { PaginationParams } from '../../../common/types';
import {
  CreateVendaUseCase,
  GetVendasUseCase,
  GetVendaByIdUseCase,
  UpdateVendaUseCase,
  FecharVendaUseCase,
  CancelarVendaUseCase,
} from '../use-cases';
import { GetVendasFilter } from '../repositories';
import { CreateVendaDto, UpdateVendaDto, FecharVendaDto } from '../dto';
import { Venda } from '../models';

@Injectable()
export class VendaService {
  constructor(
    private readonly createUseCase: CreateVendaUseCase,
    private readonly getManyUseCase: GetVendasUseCase,
    private readonly getByIdUseCase: GetVendaByIdUseCase,
    private readonly updateUseCase: UpdateVendaUseCase,
    private readonly fecharUseCase: FecharVendaUseCase,
    private readonly cancelarUseCase: CancelarVendaUseCase,
  ) {}

  create(input: CreateVendaDto): Promise<Venda> {
    return this.createUseCase.execute(input);
  }

  getMany(filter: GetVendasFilter, pagination: PaginationParams): Promise<Venda[]> {
    return this.getManyUseCase.execute({ filter, pagination });
  }

  getById(id: string): Promise<Venda> {
    return this.getByIdUseCase.execute(id);
  }

  update(id: string, data: UpdateVendaDto): Promise<Venda> {
    return this.updateUseCase.execute({ id, data });
  }

  fechar(id: string, data: FecharVendaDto): Promise<Venda> {
    return this.fecharUseCase.execute({ id, data });
  }

  cancelar(id: string): Promise<Venda> {
    return this.cancelarUseCase.execute(id);
  }
}
