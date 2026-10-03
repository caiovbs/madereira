import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Funcao } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateFuncionarioDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome: string;

  @ApiProperty({ enum: Funcao, isArray: true, enumName: 'Funcao' })
  @IsArray()
  @IsEnum(Funcao, { each: true })
  funcoes: Funcao[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;
}
