import { Module } from '@nestjs/common';
import { ViewingService } from './viewing.service';
import { ViewingController } from './viewing.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ViewingController],
  providers: [ViewingService],
  imports: [PrismaModule],
  exports: [ViewingService],
})
export class ViewingModule {}
