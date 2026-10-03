import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { CompraStatus } from '@prisma/client'
import { GetPagination } from '../../../common/decorators'
import type { PaginationParams } from '../../../common/types'
import { CompraService } from '../services'
import { CreateCompraDto, UpdateCompraDto, ReceberCompraDto } from '../dto'

@Controller('compras')
@ApiTags('Compras')
export class CompraController {
  constructor(private readonly service: CompraService) {}

  @Get('/')
  @ApiQuery({ name: 'status', required: false, enum: CompraStatus, enumName: 'CompraStatus' })
  @ApiQuery({ name: 'fornecedorId', required: false })
  getMany(
    @GetPagination() pagination: PaginationParams,
    @Query('status') status?: CompraStatus,
    @Query('fornecedorId') fornecedorId?: string
  ) {
    return this.service.getMany({ status, fornecedorId }, pagination)
  }

  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id)
  }

  @Post('/')
  create(@Body() body: CreateCompraDto) {
    return this.service.create(body)
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateCompraDto) {
    return this.service.update(id, body)
  }

  @Post('/:id/receber')
  receber(@Param('id') id: string, @Body() body: ReceberCompraDto) {
    return this.service.receber(id, body)
  }

  @Post('/:id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.service.cancelar(id)
  }
}
