import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TitleType } from '@prisma/client';
import { TitleService } from 'src/title/title.service';
import { SeasonService } from 'src/season/season.service';

@Injectable()
export class EpisodeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly titleService: TitleService,
    private readonly seasonService: SeasonService,
  ) {}

  async create(
    titleId: number,
    seasonNumber: number | null,
    createEpisodeDto: CreateEpisodeDto,
  ) {
    const episode = {
      titleId,
      ...createEpisodeDto,
    };

    const title = await this.titleService.findOne(titleId);

    if (seasonNumber) {
      const season = await this.seasonService.findOneByNumber(
        titleId,
        seasonNumber,
      );
      episode['seasonId'] = season.id;

      const alreadyExists = await this.prisma.episode.findFirst({
        where: {
          titleId,
          seasonId: season.id,
          episodeNumber: episode.episodeNumber,
        },
      });

      if (alreadyExists) {
        throw new BadRequestException(
          `Episode number ${episode.episodeNumber} for season ${seasonNumber} of title ${titleId} already exists`,
        );
      }

      return await this.prisma.episode.create({
        data: episode,
      });
    }

    if (title.type === TitleType.SERIES) {
      throw new BadRequestException(
        `Title ${titleId} is of type SERIES, must provide season number to create episode`,
      );
    }

    const alreadyExists = await this.prisma.episode.findFirst({
      where: { titleId },
    });

    if (alreadyExists) {
      throw new BadRequestException(
        `Episode for title ${titleId} already exists`,
      );
    }

    return await this.prisma.episode.create({
      data: episode,
    });
  }

  async findAll(titleId: number, seasonNumber: number) {
    const season = await this.seasonService.findOneByNumber(
      titleId,
      seasonNumber,
    );

    return await this.prisma.episode.findMany({
      where: { titleId, seasonId: season.id },
      orderBy: { episodeNumber: 'asc' },
    });
  }

  async findOne(
    titleId: number,
    seasonNumber: number | null,
    episodeNumber: number | null,
  ) {
    const title = await this.titleService.findOne(titleId);

    if (seasonNumber) {
      const season = await this.seasonService.findOneByNumber(
        titleId,
        seasonNumber,
      );

      const episode = await this.prisma.episode.findFirst({
        where: { titleId, seasonId: season.id, episodeNumber },
      });

      if (!episode) {
        throw new NotFoundException(
          `Episode number ${episodeNumber} for season ${seasonNumber} of title ${titleId} not found`,
        );
      }

      return episode;
    }

    if (title.type === TitleType.SERIES) {
      throw new BadRequestException(
        `Title ${titleId} is of type SERIES, must provide season number to find episode`,
      );
    }

    const episode = await this.prisma.episode.findFirst({
      where: { titleId },
    });

    if (!episode) {
      throw new NotFoundException(`Episode for title ${titleId} not found`);
    }

    return episode;
  }

  async update(
    titleId: number,
    seasonNumber: number | null,
    episodeNumber: number | null,
    updateEpisodeDto: UpdateEpisodeDto,
  ) {
    const episode = await this.findOne(titleId, seasonNumber, episodeNumber);

    return this.prisma.episode.update({
      where: { id: episode.id },
      data: updateEpisodeDto,
    });
  }

  async remove(
    titleId: number,
    seasonNumber: number | null,
    episodeNumber: number | null,
  ) {
    const episode = await this.findOne(titleId, seasonNumber, episodeNumber);

    return this.prisma.episode.delete({ where: { id: episode.id } });
  }
}
