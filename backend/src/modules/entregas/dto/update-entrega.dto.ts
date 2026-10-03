import { ApiPropertyOptional } from '@nestjs/swagger';
import { Turno } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

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
}
