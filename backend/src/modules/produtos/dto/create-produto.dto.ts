import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoMadeira } from '@prisma/client';
import { IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty()
  @IsUUID()
  tipoId: string;

  @ApiProperty({ enum: EstadoMadeira, enumName: 'EstadoMadeira' })
  @IsEnum(EstadoMadeira)
  estado: EstadoMadeira;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  espessuraCm: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  larguraCm: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  comprimentoEstoqueM: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  custo?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  preco: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  estoqueMinimo?: number;
}
