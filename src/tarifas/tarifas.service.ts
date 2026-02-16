import { Injectable } from '@nestjs/common';
import { db } from '@/database/pg/db';
import { tarifasEnergia, etlRuns } from '@/database/pg/schema';
import { eq, and, like, desc, sql } from 'drizzle-orm';
import { PaginatorDto } from '@/common/dtos/paginator.dto';
import { DashboardFiltersDto } from '@/tarifas/dto/dashboard-filters.dto';
import { TarifasOptions } from '@/tarifas/interface/tarifas-options.interface';
import { PaginatorResponse } from '@/common/interfaces/paginator.interface';
import { TarifasEnergia } from '@/tarifas/interface/TarifasEnergia.interface';
import { Value } from '@/common/interfaces/value.interface';

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
      },
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

  async dashboard(params?: DashboardFiltersDto): Promise<Value[]> {
    const where = [];

    if (params?.anio) where.push(eq(tarifasEnergia.anio, params.anio));
    if (params?.periodo) where.push(eq(tarifasEnergia.periodo, params.periodo));
    if (params?.comercializadora)
      where.push(
        like(tarifasEnergia.comercializadora, `%${params.comercializadora}%`),
      );
    if (params?.nivel) where.push(eq(tarifasEnergia.nivel, params.nivel));

    const whereExpr = where.length ? and(...where) : undefined;

    const [row] = await db
      .select({
        comercializadoras: sql<number>`COUNT(DISTINCT ${tarifasEnergia.comercializadora})`,
        promedio: sql<number>`AVG(${tarifasEnergia.cuTotal})`,
        maxima: sql<number>`MAX(${tarifasEnergia.cuTotal})`,
        minima: sql<number>`MIN(${tarifasEnergia.cuTotal})`,
      })
      .from(tarifasEnergia)
      .where(whereExpr);

    const comercializadoras = Number(row?.comercializadoras ?? 0);
    const promedio = Number(row?.promedio ?? 0);
    const maxTarifa = Number(row?.maxima ?? 0);
    const minTarifa = Number(row?.minima ?? 0);

    return [
      {
        label: 'Comercializadoras',
        value: comercializadoras.toString(),
        description: 'Empresas registradas',
        icon: 'pi-building',
        colorScheme: 'primary',
      },
      {
        label: 'Tarifa Promedio',
        value: `$${promedio.toFixed(2)}`,
        description: 'CU Total $/kWh',
        icon: 'pi-chart-bar',
        colorScheme: 'blue',
      },
      {
        label: 'Tarifa Máxima',
        value: `$${maxTarifa.toFixed(2)}`,
        description: 'CU Total $/kWh',
        icon: 'pi-arrow-up',
        colorScheme: 'red',
      },
      {
        label: 'Tarifa Mínima',
        value: `$${minTarifa.toFixed(2)}`,
        description: 'CU Total $/kWh',
        icon: 'pi-arrow-down',
        colorScheme: 'green',
      },
    ];
  }

  async options(): Promise<TarifasOptions> {
    const comercialRows = await db
      .select({
        comercializadora: sql<string>`DISTINCT ${tarifasEnergia.comercializadora}`,
      })
      .from(tarifasEnergia)
      .orderBy(tarifasEnergia.comercializadora);

    const anioRows = await db
      .select({ anio: sql<number>`DISTINCT ${tarifasEnergia.anio}` })
      .from(tarifasEnergia)
      .orderBy(tarifasEnergia.anio);

    const nivelRows = await db
      .select({ nivel: sql<string>`DISTINCT ${tarifasEnergia.nivel}` })
      .from(tarifasEnergia)
      .orderBy(tarifasEnergia.nivel);

    const periodoRows = await db
      .select({ periodo: sql<string>`DISTINCT ${tarifasEnergia.periodo}` })
      .from(tarifasEnergia)
      .orderBy(tarifasEnergia.periodo);

    const comercializadoras = comercialRows.map(
      (r) => r.comercializadora ?? '',
    );
    const anios = anioRows
      .map((r) => Number(r.anio ?? 0))
      .filter((v) => v !== 0);
    const niveles = nivelRows.map((r) => r.nivel ?? '');
    const periodos = periodoRows.map((r) => r.periodo ?? '');
    return {
      comercializadoras,
      anios,
      niveles,
      periodos,
    };
  }
}
