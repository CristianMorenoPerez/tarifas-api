import { Global, Module } from '@nestjs/common';
import { db } from '@/database/pg/db';

export const PG_DB = 'PG_DB';
@Global()
@Module({
  providers: [
    {
      provide: PG_DB,
      useValue: db,
    },
  ],
  exports: [PG_DB],
})
export class DatabaseModule {}
