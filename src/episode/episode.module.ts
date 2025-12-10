import { Module } from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { MovieEpisodeController, SeriesEpisodeController } from './episode.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TitleModule } from 'src/title/title.module';
import { SeasonModule } from 'src/season/season.module';

@Module({
  controllers: [MovieEpisodeController, SeriesEpisodeController],
  providers: [EpisodeService],
  imports: [PrismaModule, TitleModule, SeasonModule],
  exports: [EpisodeService],
})
export class EpisodeModule {}
