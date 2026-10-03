import { ApiPropertyOptional } from '@nestjs/swagger';
import { FormaPagamento } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateItemCompraDto {
  @ApiPropertyOptional()
  @IsUUID()
  produtoId: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  custoUnit: number;
}

export class UpdateCompraDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  fornecedorId?: string | null;

  @ApiPropertyOptional({ type: [UpdateItemCompraDto], description: 'Substitui todos os itens.' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateItemCompraDto)
  itens?: UpdateItemCompraDto[];

  @ApiPropertyOptional({ enum: FormaPagamento, enumName: 'FormaPagamento' })
  @IsOptional()
  @IsEnum(FormaPagamento)
  formaPagamento?: FormaPagamento;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  vencimento?: string;
}
