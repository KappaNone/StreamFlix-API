import { Module } from '@nestjs/common';
import { QualityService } from './quality.service';
import { QualityController } from './quality.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TitleService } from 'src/title/title.service';

@Module({
  controllers: [QualityController],
  providers: [QualityService, TitleService],
  imports: [PrismaModule],
  exports: [QualityService],
})
export class QualityModule {}
