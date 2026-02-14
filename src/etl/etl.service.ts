import { AxiosAdapter } from '@/common/adapters/axios.adapter';
import { Injectable } from '@nestjs/common';
import { TarifaEtl } from './interface/tarifa-etl.interface';
import { envs } from '@/config/envs';
import { sql } from 'drizzle-orm';
import { db } from '@/database/pg/db';
import { etlRuns } from '@/database/pg/schema';
import { MailService } from '@/common/mail/mail.service';

@Injectable()
export class EtlService {
  constructor(
    private readonly http: AxiosAdapter,
    private readonly mail: MailService,
  ) {}

  async runEtl() {
    try {
      const inicio = Date.now();

      const data = await this.http.get<TarifaEtl[]>(envs.apiTarifa);

      if (!data || data.length === 0) {
        throw new Error('No se obtuvieron datos de la API');
      }

      await db.execute(
        sql`CALL sp_insert_tarifas_bulk(${JSON.stringify(data)}::jsonb)`,
      );

      const duracion = Date.now() - inicio;

      await db.insert(etlRuns).values({
        totalRegistros: data.length,
        duracionMs: duracion,
      });

      await this.mail.send({
        to: envs.emailTo,
        subject: 'ETL tarifas ejecutado',
        text: `Se cargaron ${data.length} registros en ${duracion} ms.`,
      });

      return {
        success: true,
        mensaje: 'ETL ejecutado correctamente',
        totalRegistros: data.length,
        duracionMs: duracion,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ Error en ETL:', error);
      throw new Error(`Error ejecutando ETL: ${error.message}`);
    }
  }
}
