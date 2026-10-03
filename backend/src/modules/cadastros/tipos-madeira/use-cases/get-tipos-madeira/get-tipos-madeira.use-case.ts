import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../../common/types';
import { TipoMadeiraRepository, GetTiposMadeiraFilter } from '../../repositories';
import { TipoMadeira } from '../../models';

@Injectable()
export class GetTiposMadeiraUseCase implements IUseCase<GetTiposMadeiraFilter, TipoMadeira[]> {
  constructor(private readonly repo: TipoMadeiraRepository) {}

  execute(input: GetTiposMadeiraFilter): Promise<TipoMadeira[]> {
    return this.repo.getMany(input);
  }
}
