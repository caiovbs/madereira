import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EstadoMadeira } from '@prisma/client';
import { GetPagination } from '../../../common/decorators';
import type { PaginationParams } from '../../../common/types';
import { ProdutoService } from '../services';
import { CreateProdutoDto, UpdateProdutoDto } from '../dto';

@Controller('produtos')
@ApiTags('Produtos')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get('/')
  getProdutos(
    @GetPagination() pagination: PaginationParams,
    @Query('search') search?: string,
    @Query('tipoId') tipoId?: string,
    @Query('estado') estado?: EstadoMadeira,
  ) {
    return this.produtoService.getMany({ search, tipoId, estado }, pagination);
  }

  @Get('/:id')
  getProduto(@Param('id') id: string) {
    return this.produtoService.getById(id);
  }

  @Post('/')
  createProduto(@Body() body: CreateProdutoDto) {
    return this.produtoService.create(body);
  }

  @Patch('/:id')
  updateProduto(@Param('id') id: string, @Body() body: UpdateProdutoDto) {
    return this.produtoService.update(id, body);
  }
}
