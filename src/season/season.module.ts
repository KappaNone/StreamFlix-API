import { Module } from '@nestjs/common';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [SeasonController],
  providers: [SeasonService],
  imports: [PrismaModule],
  exports: [SeasonService],
})
export class SeasonModule {}
