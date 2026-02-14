import { Module } from '@nestjs/common';
import { EtlService } from './etl.service';
import { EtlController } from './etl.controller';
import { CommonModule } from '@/common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [EtlController],
  providers: [EtlService],
})
export class EtlModule {}
