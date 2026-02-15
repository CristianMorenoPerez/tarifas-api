import { IsNumber, IsOptional, IsString } from 'class-validator';

interface QueryParams {
  anio?: number;
  periodo?: string;
  comercializadora?: string;
  nivel?: string;
  limit?: number;
  offset?: number;
}

export class PaginatorDto implements QueryParams {
  @IsOptional()
  @IsNumber()
  anio?: number;
  @IsOptional()
  @IsString()
  periodo?: string;
  @IsOptional()
  @IsString()
  comercializadora?: string;
  @IsOptional()
  @IsString()
  nivel?: string;
  @IsNumber()
  limit: number;
  @IsNumber()
  offset: number;
}
