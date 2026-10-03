import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { ObjectAlreadyExistsError, ObjectNotFoundError } from '../../../../common/errors';
import { Logger } from '../../../../common/utils';
import { ProdutoRepository } from '../../repositories';
import { Produto } from '../../models';
import { CreateProdutoDto } from '../../dto';
import { buildProdutoNome } from '../../utils/build-produto-nome';

@Injectable()
export class CreateProdutoUseCase implements IUseCase<CreateProdutoDto, Produto> {
  constructor(private readonly produtoRepository: ProdutoRepository) {}

  async execute(input: CreateProdutoDto): Promise<Produto> {
    const tipo = await this.produtoRepository.findTipo(input.tipoId);
    if (!tipo) {
      throw new ObjectNotFoundError({ objectType: 'TipoMadeira', field: 'id' });
    }

    const attrs = {
      tipoId: input.tipoId,
      estado: input.estado,
      espessuraCm: input.espessuraCm,
      larguraCm: input.larguraCm,
      comprimentoEstoqueM: input.comprimentoEstoqueM,
    };

    const existing = await this.produtoRepository.findByAttributes(attrs);
    if (existing) {
      throw new ObjectAlreadyExistsError({
        objectType: 'Produto',
        field: 'tipo/estado/medidas',
      });
    }

    const nome = buildProdutoNome({ tipoNome: tipo.nome, ...attrs });
    Logger.info(`Criando produto: ${nome}`);

    return this.produtoRepository.create({
      ...attrs,
      nome,
      custo: input.custo ?? 0,
      preco: input.preco,
      estoqueMinimo: input.estoqueMinimo ?? 0,
    });
  }
}
