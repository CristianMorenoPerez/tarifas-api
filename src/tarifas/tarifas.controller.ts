import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { TarifasService } from './tarifas.service';
import { PaginatorDto } from '@/common/dtos/paginator.dto';

@ApiTags('tarifas')
@Controller('tarifas')
export class TarifasController {
  constructor(private readonly service: TarifasService) {}

  @Get()
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
  lastUpdate() {
    return this.service.lastUpdate();
  }
}
