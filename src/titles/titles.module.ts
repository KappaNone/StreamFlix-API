import { Module } from '@nestjs/common';
import { TitlesService } from './titles.service';
import { TitlesController } from './titles.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [TitlesController],
  providers: [TitlesService],
  imports: [PrismaModule],
  exports: [TitlesService],
})
export class TitlesModule {}
