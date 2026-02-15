import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EtlService } from './etl.service';

@Injectable()
export class EtlScheduler {
  private readonly logger = new Logger(EtlScheduler.name);

  constructor(private readonly etlService: EtlService) {}

  /**
   * Ejecuta el ETL cada día a las 2 AM
   * Expresión cron: 0 2 * * * (minuto 0, hora 2)
   * 
   */
  @Cron('0 2 * * *') // Para pruebas, ejecuta cada 5 segundos. Cambiar a '0 2 * * *' para producción.
  async handleCronEtl() {
    this.logger.log(' Iniciando ETL programado (Cron)...');
    try {
      const result = await this.etlService.runEtl();
      this.logger.log(` ETL completado: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(` Error en ETL programado: ${error.message}`);
    }
  }
}
