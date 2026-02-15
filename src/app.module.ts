import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { EtlModule } from './etl/etl.module';
import { TarifasModule } from './tarifas/tarifas.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    CommonModule,
    EtlModule,
    TarifasModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
