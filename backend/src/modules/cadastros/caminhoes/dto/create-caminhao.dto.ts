import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCaminhaoDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  descricao: string;

  @ApiPropertyOptional({ example: 'ABC-1234' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  placa?: string;
}
