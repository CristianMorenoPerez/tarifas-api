import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TarifasService } from './tarifas.service';

@ApiTags('tarifas')
@Controller('tarifas')
export class TarifasController {
  constructor(private readonly service: TarifasService) {}

  @Get()
  @ApiQuery({ name: 'anio', required: false, type: Number })
  @ApiQuery({ name: 'periodo', required: false, type: String })
  @ApiQuery({ name: 'comercializadora', required: false, type: String })
  @ApiQuery({ name: 'nivel', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  find(@Query() query: any) {
    const params = {
      anio: query.anio ? Number(query.anio) : undefined,
      periodo: query.periodo,
      comercializadora: query.comercializadora,
      nivel: query.nivel,
      limit: query.limit ? Number(query.limit) : undefined,
      offset: query.offset ? Number(query.offset) : undefined,
    };
    return this.service.find(params);
  }

  @Get('ultima-actualizacion')
  lastUpdate() {
    return this.service.lastUpdate();
  }
}
