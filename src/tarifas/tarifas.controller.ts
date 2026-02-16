import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TarifasService } from './tarifas.service';
import { PaginatorDto } from '@/common/dtos/paginator.dto';
import { DashboardFiltersDto } from '@/tarifas/dto/dashboard-filters.dto';
import { TarifasOptions } from '@/tarifas/interface/tarifas-options.interface';

@ApiTags('tarifas')
@Controller('tarifas')
export class TarifasController {
  constructor(private readonly service: TarifasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tarifas con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Listado paginado de tarifas' })
  @ApiQuery({ name: 'anio', required: false, type: Number })
  @ApiQuery({ name: 'periodo', required: false, type: String })
  @ApiQuery({ name: 'comercializadora', required: false, type: String })
  @ApiQuery({ name: 'nivel', required: false, type: String })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiQuery({ name: 'offset', required: true, type: Number })
  find(@Query() query: PaginatorDto) {
    return this.service.find(query);
  }

  @Get('ultima-actualizacion')
  @ApiOperation({ summary: 'Obtener la última ejecución del ETL' })
  @ApiResponse({
    status: 200,
    description: 'Información de la última ejecución del ETL',
  })
  lastUpdate() {
    return this.service.lastUpdate();
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener métricas agregadas del dashboard' })
  @ApiResponse({
    status: 200,
    description: 'KPIs: comercializadoras, tarifa promedio, máxima y mínima',
  })
  @ApiQuery({ name: 'anio', required: false, type: Number })
  @ApiQuery({ name: 'periodo', required: false, type: String })
  @ApiQuery({ name: 'comercializadora', required: false, type: String })
  @ApiQuery({ name: 'nivel', required: false, type: String })
  dashboard(@Query() query: DashboardFiltersDto) {
    return this.service.dashboard(query);
  }

  @Get('options')
  @ApiOperation({
    summary: 'Obtener opciones para filtros: comercializadoras, años y niveles',
  })
  @ApiResponse({
    status: 200,
    description: 'Opciones disponibles para filtros',
    schema: {
      type: 'object',
      properties: {
        comercializadoras: { type: 'array', items: { type: 'string' } },
        anios: { type: 'array', items: { type: 'number' } },
        niveles: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async options(): Promise<TarifasOptions> {
    return this.service.options();
  }
}
