import { Injectable } from '@nestjs/common';
import {
  CreateTipoMadeiraUseCase,
  GetTiposMadeiraUseCase,
  GetTipoMadeiraByIdUseCase,
  UpdateTipoMadeiraUseCase,
} from '../use-cases';
import { GetTiposMadeiraFilter } from '../repositories';
import { CreateTipoMadeiraDto, UpdateTipoMadeiraDto } from '../dto';
import { TipoMadeira } from '../models';

@Injectable()
export class TipoMadeiraService {
  constructor(
    private readonly createUseCase: CreateTipoMadeiraUseCase,
    private readonly getManyUseCase: GetTiposMadeiraUseCase,
    private readonly getByIdUseCase: GetTipoMadeiraByIdUseCase,
    private readonly updateUseCase: UpdateTipoMadeiraUseCase,
  ) {}

  create(input: CreateTipoMadeiraDto): Promise<TipoMadeira> {
    return this.createUseCase.execute(input);
  }

  getMany(filter: GetTiposMadeiraFilter): Promise<TipoMadeira[]> {
    return this.getManyUseCase.execute(filter);
  }

  getById(id: string): Promise<TipoMadeira> {
    return this.getByIdUseCase.execute(id);
  }

  update(id: string, data: UpdateTipoMadeiraDto): Promise<TipoMadeira> {
    return this.updateUseCase.execute({ id, data });
  }
}
