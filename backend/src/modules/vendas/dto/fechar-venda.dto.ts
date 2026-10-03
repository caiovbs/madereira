import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FormaPagamento } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class FecharVendaDto {
  @ApiProperty({ enum: FormaPagamento, enumName: 'FormaPagamento' })
  @IsEnum(FormaPagamento)
  formaPagamento: FormaPagamento;

  @ApiPropertyOptional({ description: 'Obrigatório se formaPagamento=prazo.' })
  @IsOptional()
  @IsDateString()
  vencimento?: string;
}
