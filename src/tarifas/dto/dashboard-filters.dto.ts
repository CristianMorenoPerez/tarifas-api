import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class DashboardFiltersDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsNumber()
  anio?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  periodo?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  comercializadora?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  nivel?: string;
}
