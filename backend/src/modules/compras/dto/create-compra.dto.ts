import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateItemCompraDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  custoUnit: number;
}

export class CreateCompraDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  fornecedorId?: string;

  @ApiProperty({ type: [CreateItemCompraDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemCompraDto)
  itens: CreateItemCompraDto[];

  @ApiPropertyOptional({ enum: FormaPagamento, enumName: 'FormaPagamento' })
  @IsOptional()
  @IsEnum(FormaPagamento)
  formaPagamento?: FormaPagamento;

  @ApiPropertyOptional({ description: 'ISO date (YYYY-MM-DD). Obrigatório se formaPagamento=prazo.' })
  @IsOptional()
  @IsDateString()
  vencimento?: string;
}
