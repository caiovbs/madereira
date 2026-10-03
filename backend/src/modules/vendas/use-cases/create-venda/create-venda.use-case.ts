import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/types';
import { ObjectNotFoundError } from '../../../../common/errors';
import { ProdutoRepository } from '../../../produtos/repositories';
import { VendaRepository } from '../../repositories';
import { Venda } from '../../models';
import { CreateVendaDto } from '../../dto';

@Injectable()
export class CreateVendaUseCase implements IUseCase<CreateVendaDto, Venda> {
  constructor(
    private readonly vendaRepository: VendaRepository,
    private readonly produtoRepository: ProdutoRepository,
  ) {}

  async execute(input: CreateVendaDto): Promise<Venda> {
    const itensComPreco = await Promise.all(
      input.itens.map(async (item) => {
        const produto = await this.produtoRepository.getById(item.produtoId);
        if (!produto) throw new ObjectNotFoundError({ objectType: 'Produto', field: 'id' });
        const precoUnit = produto.preco;
        return {
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnit,
          cortarParaM: item.cortarParaM,
          aparelhar: item.aparelhar ?? false,
          subtotalLinha: item.quantidade * precoUnit,
        };
      }),
    );
    return this.vendaRepository.create(input, itensComPreco);
  }
}
