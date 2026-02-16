import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EtlService } from './etl.service';

@ApiTags('etl')
@Controller('etl')
export class EtlController {
  constructor(private readonly etlService: EtlService) {}

  @Post('run')
  @ApiOperation({ summary: 'Ejecutar proceso ETL' })
  @ApiResponse({ status: 200, description: 'ETL ejecutado correctamente' })
  @ApiResponse({ status: 500, description: 'Error al ejecutar ETL' })
  runEtl() {
    return this.etlService.runEtl();
  }
}
