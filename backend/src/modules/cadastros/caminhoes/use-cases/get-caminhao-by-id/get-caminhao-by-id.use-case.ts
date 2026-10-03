import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectNotFoundError } from '../../../../../common/errors';
import { CaminhaoRepository } from '../../repositories';
import { Caminhao } from '../../models';

@Injectable()
export class GetCaminhaoByIdUseCase implements IUseCase<string, Caminhao> {
  constructor(private readonly repo: CaminhaoRepository) {}

  async execute(id: string): Promise<Caminhao> {
    const caminhao = await this.repo.getById(id);
    if (!caminhao) throw new ObjectNotFoundError({ objectType: 'Caminhao', field: 'id' });
    return caminhao;
  }
}
