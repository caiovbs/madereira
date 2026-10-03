import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoEntrega } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpdateItemVendaDto {
  @ApiPropertyOptional()
  @IsUUID()
  produtoId: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  quantidade: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @IsPositive()
  cortarParaM?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aparelhar?: boolean;
}

export class UpdateVendaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clienteId?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  obraRef?: string;

  @ApiPropertyOptional({ enum: TipoEntrega, enumName: 'TipoEntrega' })
  @IsOptional()
  @IsEnum(TipoEntrega)
  tipoEntrega?: TipoEntrega;

  @ApiPropertyOptional({ type: [UpdateItemVendaDto], description: 'Substitui todos os itens.' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateItemVendaDto)
  itens?: UpdateItemVendaDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  frete?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  desconto?: number;
}
