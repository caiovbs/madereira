import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TipoEntrega } from '@prisma/client'
import { Type } from 'class-transformer'
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
  ValidateNested
} from 'class-validator'

export class CreateItemVendaDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantidade: number

  @ApiPropertyOptional({
    description: 'Comprimento de corte em metros. Omitir se não precisar cortar.'
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  cortarParaM?: number

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  aparelhar?: boolean
}

export class CreateVendaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clienteId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  obraRef?: string

  @ApiPropertyOptional({ enum: TipoEntrega, enumName: 'TipoEntrega', default: TipoEntrega.retirada })
  @IsOptional()
  @IsEnum(TipoEntrega)
  tipoEntrega?: TipoEntrega

  @ApiProperty({ type: [CreateItemVendaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemVendaDto)
  itens: CreateItemVendaDto[]

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  frete?: number

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  desconto?: number
}
