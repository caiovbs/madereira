import { Injectable } from '@nestjs/common';
import { VendaStatus } from '@prisma/client';
import { IUseCase } from '../../../../common/types';
import { BusinessRuleError, ObjectNotFoundError } from '../../../../common/errors';
import { ProdutoRepository } from '../../../produtos/repositories';
import { VendaRepository } from '../../repositories';
import { Venda } from '../../models';
import { UpdateVendaDto } from '../../dto';

interface UpdateVendaInput {
  id: string;
  data: UpdateVendaDto;
}

@Injectable()
export class UpdateVendaUseCase implements IUseCase<UpdateVendaInput, Venda> {
  constructor(
    private readonly vendaRepository: VendaRepository,
    private readonly produtoRepository: ProdutoRepository,
  ) {}

  async execute({ id, data }: UpdateVendaInput): Promise<Venda> {
    const venda = await this.vendaRepository.getById(id);
    if (!venda) throw new ObjectNotFoundError({ objectType: 'Venda', field: 'id' });
    if (venda.status !== VendaStatus.orcamento) {
      throw new BusinessRuleError('Venda só pode ser editada enquanto for orçamento.');
    }

    let itensComPreco: any[] | undefined;
    if (data.itens !== undefined) {
      itensComPreco = await Promise.all(
        data.itens.map(async (item) => {
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
    }

    return this.vendaRepository.update(id, data, itensComPreco);
  }
}
