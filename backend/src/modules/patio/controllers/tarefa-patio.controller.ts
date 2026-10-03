import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TarefaStatus, TarefaTipo } from '@prisma/client';
import { TarefaPatioService } from '../services';

@Controller('patio/tarefas')
@ApiTags('Pátio')
export class TarefaPatioController {
  constructor(private readonly service: TarefaPatioService) {}

  @Get('/')
  @ApiQuery({ name: 'status', required: false, enum: TarefaStatus, enumName: 'TarefaStatus' })
  @ApiQuery({ name: 'tipo', required: false, enum: TarefaTipo, enumName: 'TarefaTipo' })
  @ApiQuery({ name: 'vendaId', required: false })
  getMany(
    @Query('status') status?: TarefaStatus,
    @Query('tipo') tipo?: TarefaTipo,
    @Query('vendaId') vendaId?: string,
  ) {
    return this.service.getMany({ status, tipo, vendaId });
  }

  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/:id/concluir')
  concluir(@Param('id') id: string) {
    return this.service.concluir(id);
  }
}
