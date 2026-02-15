import { Injectable } from '@nestjs/common';
import { db } from '@/database/pg/db';
import { tarifasEnergia, etlRuns } from '@/database/pg/schema';
import { eq, and, like, desc, sql } from 'drizzle-orm';
import { PaginatorDto } from '@/common/dtos/paginator.dto';
import { PaginatorResponse } from '@/common/interfaces/paginator.interface';
import { TarifasEnergia } from '@/tarifas/interface/TarifasEnergia.interface';



@Injectable()
export class TarifasService {
  async find(params: PaginatorDto): Promise<PaginatorResponse<TarifasEnergia>> {
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
      pages: rows.map((row) => ({
        ...row,
        cuTotal: Number(row.cuTotal),
      })),
      meta: {
        total: Number(countRow?.count ?? 0),
        page: params.offset ?? 1,
        limit,
        totalPages: Math.ceil(Number(countRow?.count ?? 0) / limit),
      }
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

  async dashboard() {
    const [row] = await db
      .select({
        comercializadoras: sql<number>`COUNT(DISTINCT ${tarifasEnergia.comercializadora})`,
        promedio: sql<number>`AVG(${tarifasEnergia.cuTotal})`,
        maxima: sql<number>`MAX(${tarifasEnergia.cuTotal})`,
        minima: sql<number>`MIN(${tarifasEnergia.cuTotal})`,
      })
      .from(tarifasEnergia);

    const comercializadoras = Number(row?.comercializadoras ?? 0);
    const promedio = row?.promedio ? Number(row.promedio) : 0;
    const maxima = row?.maxima ? Number(row.maxima) : 0;
    const minima = row?.minima ? Number(row.minima) : 0;

    return {
      comercializadoras,
      tarifaPromedio: Number(promedio.toFixed(2)),
      tarifaMaxima: Number(maxima.toFixed(2)),
      tarifaMinima: Number(minima.toFixed(2)),
    };
  }
}
