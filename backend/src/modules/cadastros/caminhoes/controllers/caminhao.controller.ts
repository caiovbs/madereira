import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiQuery, ApiTags } from '@nestjs/swagger'
import { CaminhaoService } from '../services'
import { CreateCaminhaoDto, UpdateCaminhaoDto } from '../dto'

@Controller('caminhoes')
@ApiTags('Caminhões')
export class CaminhaoController {
  constructor(private readonly service: CaminhaoService) {}

  @Get('/')
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'ativo', required: false, type: Boolean })
  getMany(@Query('search') search?: string, @Query('ativo') ativo?: string) {
    return this.service.getMany({
      search,
      ativo: ativo !== undefined ? ativo === 'true' : undefined
    })
  }

  @Get('/:id')
  getById(@Param('id') id: string) {
    return this.service.getById(id)
  }

  @Post('/')
  create(@Body() body: CreateCaminhaoDto) {
    return this.service.create(body)
  }

  @Patch('/:id')
  update(@Param('id') id: string, @Body() body: UpdateCaminhaoDto) {
    return this.service.update(id, body)
  }
}
