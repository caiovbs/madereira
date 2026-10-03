import { Injectable } from '@nestjs/common'
import type { PaginationParams } from '../../../common/types'
import {
  CreateCompraUseCase,
  GetComprasUseCase,
  GetCompraByIdUseCase,
  UpdateCompraUseCase,
  ReceberCompraUseCase,
  CancelarCompraUseCase
} from '../use-cases'
import { GetComprasFilter } from '../repositories'
import { CreateCompraDto, UpdateCompraDto, ReceberCompraDto } from '../dto'
import { Compra } from '../models'

@Injectable()
export class CompraService {
  constructor(
    private readonly createUseCase: CreateCompraUseCase,
    private readonly getManyUseCase: GetComprasUseCase,
    private readonly getByIdUseCase: GetCompraByIdUseCase,
    private readonly updateUseCase: UpdateCompraUseCase,
    private readonly receberUseCase: ReceberCompraUseCase,
    private readonly cancelarUseCase: CancelarCompraUseCase
  ) {}

  create(input: CreateCompraDto): Promise<Compra> {
    return this.createUseCase.execute(input)
  }

  getMany(filter: GetComprasFilter, pagination: PaginationParams): Promise<Compra[]> {
    return this.getManyUseCase.execute({ filter, pagination })
  }

  getById(id: string): Promise<Compra> {
    return this.getByIdUseCase.execute(id)
  }

  update(id: string, data: UpdateCompraDto): Promise<Compra> {
    return this.updateUseCase.execute({ id, data })
  }

  receber(id: string, data: ReceberCompraDto): Promise<Compra> {
    return this.receberUseCase.execute({ id, data })
  }

  cancelar(id: string): Promise<Compra> {
    return this.cancelarUseCase.execute(id)
  }
}
