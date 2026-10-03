import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { CaminhaoRepository } from '../../repositories';
import { Caminhao } from '../../models';
import { CreateCaminhaoDto } from '../../dto';

@Injectable()
export class CreateCaminhaoUseCase implements IUseCase<
  CreateCaminhaoDto,
  Caminhao
> {
  constructor(private readonly repo: CaminhaoRepository) {}

  execute(input: CreateCaminhaoDto): Promise<Caminhao> {
    return this.repo.create(input);
  }
}
