import { Test, TestingModule } from '@nestjs/testing';
import { EpisodeService } from './episode.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TitleService } from 'src/title/title.service';
import { SeasonService } from 'src/season/season.service';
import { BadRequestException } from '@nestjs/common';
import { TitleType } from '@prisma/client';

describe('EpisodeService', () => {
  let service: EpisodeService;
  let titleService: { findOne: jest.Mock };

  beforeEach(async () => {
    titleService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EpisodeService,
        { provide: PrismaService, useValue: { episode: {} } },
        { provide: TitleService, useValue: titleService },
        { provide: SeasonService, useValue: { findOneByNumber: jest.fn() } },
      ],
    }).compile();

    service = module.get<EpisodeService>(EpisodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects creating a series episode without seasonNumber', async () => {
    titleService.findOne.mockResolvedValue({ id: 1, type: TitleType.SERIES });

    await expect(
      service.create(1, null, {
        episodeNumber: 1,
        durationSeconds: 10,
        videoUrl: 'x',
        name: null,
        description: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
