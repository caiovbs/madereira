import { ApiPropertyOptional } from '@nestjs/swagger';
import { Turno } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class UpdateEntregaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  caminhaoId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  motoristaId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  endereco?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observacao?: string;

  @ApiPropertyOptional({ description: 'ISO date (YYYY-MM-DD).' })
  @IsOptional()
  @IsDateString()
  dataAgendada?: string;

  @ApiPropertyOptional({ enum: Turno, enumName: 'Turno' })
  @IsOptional()
  @IsEnum(Turno)
  turno?: Turno;

  @ApiPropertyOptional({ description: 'Posição no mapa; use para corrigir um endereço geocodificado errado.' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
