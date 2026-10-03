import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TipoMadeiraService } from '../services';
import { CreateTipoMadeiraDto, UpdateTipoMadeiraDto } from '../dto';

@Controller('tipos-madeira')
@ApiTags('Tipos de Madeira')
export class TipoMadeiraController {
  constructor(private readonly service: TipoMadeiraService) {}

  @Get('/')
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'ativo', required: false, type: Boolean })
  getMany(@Query('search') search?: string, @Query('ativo') ativo?: string) {
    return this.service.getMany({
      search,
      ativo: ativo !== undefined ? ativo === 'true' : undefined,
    });
  }

  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/')
  create(@Body() body: CreateTipoMadeiraDto) {
    return this.service.create(body);
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateTipoMadeiraDto) {
    return this.service.update(id, body);
  }
}
