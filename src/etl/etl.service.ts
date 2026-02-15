import { AxiosAdapter } from '@/common/adapters/axios.adapter';
import { Injectable, Logger } from '@nestjs/common';
import { TarifaEtl } from './interface/tarifa-etl.interface';
import { envs } from '@/config/envs';
import { sql } from 'drizzle-orm';
import { db } from '@/database/pg/db';
import { etlRuns } from '@/database/pg/schema';
import { MailService } from '@/common/mail/mail.service';
import { ExternalApiException, BusinessException } from '@/common/exceptions/custom.exceptions';

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(
    private readonly http: AxiosAdapter,
    private readonly mail: MailService,
  ) {}

  async runEtl() {
    const inicioProceso = Date.now();

    // Extracción: obtener datos de la API
    const { data, duration: duracionApi } = await this.http.get<TarifaEtl[]>(envs.apiTarifa);

    if (!data || data.length === 0) {
      throw new ExternalApiException(
        'No se obtuvieron datos de la API de tarifas',
        'datos.gov.co',
      );
    }


    // Transformación y Cargue
    const inicioDb = Date.now();
    await db.execute(
      sql`CALL sp_insert_tarifas_bulk(${JSON.stringify(data)}::jsonb)`,
    );
    const duracionDb = Date.now() - inicioDb;

    const duracionTotal = Date.now() - inicioProceso;

    // Registrar ejecución
    await db.insert(etlRuns).values({
      totalRegistros: data.length,
      duracionMs: duracionTotal,
    });



    // Enviar notificación por email
    await this.mail.send({
      to: envs.emailTo,
      subject: 'ETL tarifas ejecutado',
      text: `Se cargaron ${data.length} registros en ${duracionTotal}ms (API: ${duracionApi}ms, BD: ${duracionDb}ms).`,
    });

    return {
      success: true,
      mensaje: 'ETL ejecutado correctamente',
      totalRegistros: data.length,
      duracionMs: duracionApi,
      timestamp: new Date(),
    };
  }
}
