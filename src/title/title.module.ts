import { Module } from '@nestjs/common';
import { TitleService } from './title.service';
import { TitleController } from './title.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EpisodeModule } from 'src/episode/episode.module';


@Module({
  controllers: [TitleController],
  providers: [TitleService],
  imports: [PrismaModule],
  exports: [TitleService],
})
export class TitleModule {}
