import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { CaminhaoRepository, GetCaminhoesFilter } from '../../repositories';
import { Caminhao } from '../../models';

@Injectable()
export class GetCaminhoesUseCase implements IUseCase<GetCaminhoesFilter, Caminhao[]> {
  constructor(private readonly repo: CaminhaoRepository) {}

  execute(input: GetCaminhoesFilter): Promise<Caminhao[]> {
    return this.repo.getMany(input);
  }
}
