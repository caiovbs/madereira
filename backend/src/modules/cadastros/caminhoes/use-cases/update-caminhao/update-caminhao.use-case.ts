import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { ObjectNotFoundError } from '../../../../../common/errors';
import { CaminhaoRepository } from '../../repositories';
import { Caminhao } from '../../models';
import { UpdateCaminhaoDto } from '../../dto';

interface UpdateCaminhaoInput {
  id: string;
  data: UpdateCaminhaoDto;
}

@Injectable()
export class UpdateCaminhaoUseCase implements IUseCase<UpdateCaminhaoInput, Caminhao> {
  constructor(private readonly repo: CaminhaoRepository) {}

  async execute({ id, data }: UpdateCaminhaoInput): Promise<Caminhao> {
    const existing = await this.repo.getById(id);
    if (!existing) throw new ObjectNotFoundError({ objectType: 'Caminhao', field: 'id' });
    return this.repo.update(id, data);
  }
}
