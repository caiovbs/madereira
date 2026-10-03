import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Funcao } from '@prisma/client';
import { FuncionarioService } from '../services';
import { CreateFuncionarioDto, UpdateFuncionarioDto } from '../dto';

@Controller('funcionarios')
@ApiTags('Funcionários')
export class FuncionarioController {
  constructor(private readonly service: FuncionarioService) {}

  @Get('/')
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'funcao', required: false, enum: Funcao, enumName: 'Funcao' })
  @ApiQuery({ name: 'ativo', required: false, type: Boolean })
  getMany(
    @Query('search') search?: string,
    @Query('funcao') funcao?: Funcao,
    @Query('ativo') ativo?: string,
  ) {
    return this.service.getMany({
      search,
      funcao,
      ativo: ativo !== undefined ? ativo === 'true' : undefined,
    });
  }

  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/')
  create(@Body() body: CreateFuncionarioDto) {
    return this.service.create(body);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateFuncionarioDto) {
    return this.service.update(id, body);
  }
}
