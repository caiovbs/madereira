import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { ApiPropertyOptional, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';
import { RotaService } from './rota.service';

export class SalvarOrdemRotaDto {
  @ApiPropertyOptional({ description: 'IDs das entregas na ordem de visita (a primeira é a 1ª parada).' })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids: string[];
}

@Controller('entregas/rota')
@ApiTags('Entregas')
export class RotaController {
  constructor(private readonly service: RotaService) {}

  @Get('/')
  @ApiQuery({ name: 'data', required: true, description: 'AAAA-MM-DD' })
  @ApiQuery({ name: 'caminhaoId', required: false })
  @ApiQuery({ name: 'motoristaId', required: false })
  @ApiQuery({ name: 'otimizar', required: false, description: 'true = ignora a ordem salva e sugere uma nova (não grava).' })
  @ApiQuery({ name: 'saida', required: false, description: 'Horário de saída do caminhão, HH:MM (padrão 08:00).' })
  montar(
    @Query('data') data: string,
    @Query('caminhaoId') caminhaoId?: string,
    @Query('motoristaId') motoristaId?: string,
    @Query('otimizar') otimizar?: string,
    @Query('saida') saida?: string,
  ) {
    return this.service.montar({ data, caminhaoId, motoristaId, otimizar: otimizar === 'true', saida });
  }

  @Put('/ordem')
  salvarOrdem(@Body() body: SalvarOrdemRotaDto) {
    return this.service.salvarOrdem(body.ids);
  }
}
