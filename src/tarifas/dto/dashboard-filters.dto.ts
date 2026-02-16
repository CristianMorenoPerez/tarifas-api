import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class DashboardFiltersDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
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
