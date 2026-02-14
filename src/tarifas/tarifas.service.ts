import { Injectable } from '@nestjs/common';
import { db } from '@/database/pg/db';
import { tarifasEnergia, etlRuns } from '@/database/pg/schema';
import { eq, and, like, desc, sql } from 'drizzle-orm';

interface QueryParams {
  anio?: number;
  periodo?: string;
  comercializadora?: string;
  nivel?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class TarifasService {
  async find(params: QueryParams) {
    const where = [];
    if (params.anio) where.push(eq(tarifasEnergia.anio, params.anio));
    if (params.periodo) where.push(eq(tarifasEnergia.periodo, params.periodo));
    if (params.comercializadora)
      where.push(
        like(tarifasEnergia.comercializadora, `%${params.comercializadora}%`),
      );
    if (params.nivel) where.push(eq(tarifasEnergia.nivel, params.nivel));

    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    const whereExpr = where.length ? and(...where) : undefined;

    const rows = await db
      .select()
      .from(tarifasEnergia)
      .where(whereExpr)
      .limit(limit)
      .offset(offset);

    const [countRow] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(tarifasEnergia)
      .where(whereExpr);

    return {
      items: rows,
      total: Number(countRow?.count ?? 0),
      limit,
      offset,
    };
  }

  async lastUpdate() {
    const [row] = await db
      .select()
      .from(etlRuns)
      .orderBy(desc(etlRuns.createdAt))
      .limit(1);
    return row ?? null;
  }
}
