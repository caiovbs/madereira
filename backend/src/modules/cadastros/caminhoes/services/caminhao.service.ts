import { Injectable } from '@nestjs/common';
import {
  CreateCaminhaoUseCase,
  GetCaminhoesUseCase,
  GetCaminhaoByIdUseCase,
  UpdateCaminhaoUseCase,
} from '../use-cases';
import { GetCaminhoesFilter } from '../repositories';
import { CreateCaminhaoDto, UpdateCaminhaoDto } from '../dto';
import { Caminhao } from '../models';

@Injectable()
export class CaminhaoService {
  constructor(
    private readonly createUseCase: CreateCaminhaoUseCase,
    private readonly getManyUseCase: GetCaminhoesUseCase,
    private readonly getByIdUseCase: GetCaminhaoByIdUseCase,
    private readonly updateUseCase: UpdateCaminhaoUseCase,
  ) {}

  create(input: CreateCaminhaoDto): Promise<Caminhao> {
    return this.createUseCase.execute(input);
  }

  getMany(filter: GetCaminhoesFilter): Promise<Caminhao[]> {
    return this.getManyUseCase.execute(filter);
  }

  getById(id: string): Promise<Caminhao> {
    return this.getByIdUseCase.execute(id);
  }

  update(id: string, data: UpdateCaminhaoDto): Promise<Caminhao> {
    return this.updateUseCase.execute({ id, data });
  }
}
