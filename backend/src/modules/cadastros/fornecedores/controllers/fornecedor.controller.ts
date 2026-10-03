import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { GetPagination } from '../../../../common/decorators';
import type { PaginationParams } from '../../../../common/types';
import { FornecedorService } from '../services';
import { CreateFornecedorDto, UpdateFornecedorDto } from '../dto';

@Controller('fornecedores')
@ApiTags('Fornecedores')
export class FornecedorController {
  constructor(private readonly service: FornecedorService) {}

  @Get('/')
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'ativo', required: false, type: Boolean })
  getMany(
    @GetPagination() pagination: PaginationParams,
    @Query('search') search?: string,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.getMany(
      { search, ativo: ativo !== undefined ? ativo === 'true' : undefined },
      pagination,
    );
  }

  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/')
  create(@Body() body: CreateFornecedorDto) {
    return this.service.create(body);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateFornecedorDto) {
    return this.service.update(id, body);
  }
}
