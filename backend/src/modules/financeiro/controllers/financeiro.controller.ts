import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { LancCategoria, LancOrigem, LancSentido, LancSituacao } from '@prisma/client';
import { GetPagination } from '../../../common/decorators';
import type { PaginationParams } from '../../../common/types';
import { FinanceiroService } from '../services';
import { CreateLancamentoAvulsoDto } from '../dto';

@Controller('financeiro')
@ApiTags('Financeiro')
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}

  @Get('/caixa')
  getCaixa() {
    return this.service.getCaixa();
  }

  @Get('/lancamentos')
  @ApiQuery({ name: 'sentido', required: false, enum: LancSentido, enumName: 'LancSentido' })
  @ApiQuery({ name: 'situacao', required: false, enum: LancSituacao, enumName: 'LancSituacao' })
  @ApiQuery({ name: 'origemTipo', required: false, enum: LancOrigem, enumName: 'LancOrigem' })
  @ApiQuery({ name: 'categoria', required: false, enum: LancCategoria, enumName: 'LancCategoria' })
  getLancamentos(
    @GetPagination() pagination: PaginationParams,
    @Query('sentido') sentido?: LancSentido,
    @Query('situacao') situacao?: LancSituacao,
    @Query('origemTipo') origemTipo?: LancOrigem,
    @Query('categoria') categoria?: LancCategoria,
  ) {
    return this.service.getMany({ sentido, situacao, origemTipo, categoria }, pagination);
  }

  @Get('/lancamentos/:id')
  getLancamento(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/lancamentos')
  createAvulso(@Body() body: CreateLancamentoAvulsoDto) {
    return this.service.createAvulso(body);
  }

  @Post('/lancamentos/:id/realizar')
  realizar(@Param('id') id: string) {
    return this.service.realizar(id);
  }
}
