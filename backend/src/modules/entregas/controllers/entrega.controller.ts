import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { EntregaStatus } from '@prisma/client';
import { GetPagination } from '../../../common/decorators';
import type { PaginationParams } from '../../../common/types';
import { EntregaService } from '../services';
import { UpdateEntregaDto } from '../dto';

@Controller('entregas')
@ApiTags('Entregas')
export class EntregaController {
  constructor(private readonly service: EntregaService) {}

  @Get('/')
  @ApiQuery({ name: 'status', required: false, enum: EntregaStatus, enumName: 'EntregaStatus' })
  @ApiQuery({ name: 'motoristaId', required: false })
  @ApiQuery({ name: 'vendaId', required: false })
  getMany(
    @GetPagination() pagination: PaginationParams,
    @Query('status') status?: EntregaStatus,
    @Query('motoristaId') motoristaId?: string,
    @Query('vendaId') vendaId?: string,
  ) {
    return this.service.getMany({ status, motoristaId, vendaId }, pagination);
  }

  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateEntregaDto) {
    return this.service.update(id, body);
  }

  @Post('/:id/avancar')
  avancar(@Param('id') id: string) {
    return this.service.avancar(id);
  }
}
