import { ApiPropertyOptional } from '@nestjs/swagger';
import { Funcao } from '@prisma/client';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateFuncionarioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome?: string;

  @ApiPropertyOptional({ enum: Funcao, isArray: true, enumName: 'Funcao' })
  @IsOptional()
  @IsArray()
  @IsEnum(Funcao, { each: true })
  funcoes?: Funcao[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
