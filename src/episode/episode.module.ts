import { Module } from '@nestjs/common';
import { EpisodeService } from './episode.service';
import {
  MovieEpisodeController,
  SeriesEpisodeController,
} from './episode.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { TitleService } from 'src/title/title.service';
import { SeasonService } from 'src/season/season.service';

@Module({
  controllers: [MovieEpisodeController, SeriesEpisodeController],
  providers: [EpisodeService, TitleService, SeasonService],
  imports: [PrismaModule],
  exports: [EpisodeService],
})
export class EpisodeModule {}
