import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LancCategoria, LancSentido } from '@prisma/client';
import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateLancamentoAvulsoDto {
  @ApiProperty({ enum: LancSentido, enumName: 'LancSentido' })
  @IsEnum(LancSentido)
  sentido: LancSentido;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  descricao: string;

  @ApiPropertyOptional({ enum: LancCategoria, enumName: 'LancCategoria' })
  @IsOptional()
  @IsEnum(LancCategoria)
  categoria?: LancCategoria;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  valor: number;

  @ApiPropertyOptional({ description: 'ISO date (YYYY-MM-DD).' })
  @IsOptional()
  @IsDateString()
  vencimento?: string;
}
