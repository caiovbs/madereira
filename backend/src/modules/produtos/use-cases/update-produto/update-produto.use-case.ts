import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { ObjectNotFoundError } from '../../../../common/errors';
import { Logger } from '../../../../common/utils';
import { ProdutoRepository } from '../../repositories';
import { Produto } from '../../models';
import { UpdateProdutoDto } from '../../dto';
import { buildProdutoNome } from '../../utils/build-produto-nome';

export interface UpdateProdutoParams {
  id: string;
  data: UpdateProdutoDto;
}

@Injectable()
export class UpdateProdutoUseCase implements IUseCase<UpdateProdutoParams, Produto> {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async execute({ id, data }: UpdateProdutoParams): Promise<Produto> {
    const existing = await this.produtoRepository.getById(id);
    if (!existing) {
      throw new ObjectNotFoundError({ objectType: 'Produto', field: 'id' });
    }

    const attrs = {
      tipoId: data.tipoId ?? existing.tipoId,
      estado: data.estado ?? existing.estado,
      espessuraCm: data.espessuraCm ?? existing.espessuraCm,
      larguraCm: data.larguraCm ?? existing.larguraCm,
      comprimentoEstoqueM: data.comprimentoEstoqueM ?? existing.comprimentoEstoqueM,
    };

    const tipo = await this.produtoRepository.findTipo(attrs.tipoId);
    if (!tipo) {
      throw new ObjectNotFoundError({ objectType: 'TipoMadeira', field: 'id' });
    }

    const nome = buildProdutoNome({ tipoNome: tipo.nome, ...attrs });
    Logger.info(`Atualizando produto ${id}: ${nome}`);

    return this.produtoRepository.update(id, { ...data, ...attrs, nome });
  }
}
