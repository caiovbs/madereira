import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { VendaStatus } from '@prisma/client';
import { GetPagination } from '../../../common/decorators';
import type { PaginationParams } from '../../../common/types';
import { VendaService } from '../services';
import { CreateVendaDto, UpdateVendaDto, FecharVendaDto } from '../dto';

@Controller('vendas')
@ApiTags('Vendas')
export class VendaController {
  constructor(private readonly service: VendaService) {}

  @Get('/')
  @ApiQuery({ name: 'status', required: false, enum: VendaStatus, enumName: 'VendaStatus' })
  @ApiQuery({ name: 'clienteId', required: false })
  getMany(
    @GetPagination() pagination: PaginationParams,
    @Query('status') status?: VendaStatus,
    @Query('clienteId') clienteId?: string,
  ) {
    return this.service.getMany({ status, clienteId }, pagination);
  }

  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/')
  create(@Body() body: CreateVendaDto) {
    return this.service.create(body);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateVendaDto) {
    return this.service.update(id, body);
  }

  @Post('/:id/fechar')
  fechar(@Param('id') id: string, @Body() body: FecharVendaDto) {
    return this.service.fechar(id, body);
  }

  @Post('/:id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.service.cancelar(id);
  }
}
