import { Test, TestingModule } from '@nestjs/testing';
import {
  MovieEpisodeController,
  SeriesEpisodeController,
} from './episode.controller';
import { EpisodeService } from './episode.service';

describe('MovieEpisodeController', () => {
  let controller: MovieEpisodeController;
  let episodeService: { create: jest.Mock };

  beforeEach(async () => {
    episodeService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieEpisodeController],
      providers: [{ provide: EpisodeService, useValue: episodeService }],
    }).compile();

    controller = module.get<MovieEpisodeController>(MovieEpisodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create to EpisodeService', async () => {
    episodeService.create.mockResolvedValue({ id: 1 });

    await controller.create(1, { episodeNumber: 1, durationSeconds: 10, videoUrl: 'x', name: null, description: null });

    expect(episodeService.create).toHaveBeenCalled();
  });
});

describe('SeriesEpisodeController', () => {
  let controller: SeriesEpisodeController;
  let episodeService: { create: jest.Mock };

  beforeEach(async () => {
    episodeService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeriesEpisodeController],
      providers: [{ provide: EpisodeService, useValue: episodeService }],
    }).compile();

    controller = module.get<SeriesEpisodeController>(SeriesEpisodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates create to EpisodeService', async () => {
    episodeService.create.mockResolvedValue({ id: 1 });

    await controller.create(1, 1, { episodeNumber: 1, durationSeconds: 10, videoUrl: 'x', name: null, description: null });

    expect(episodeService.create).toHaveBeenCalledWith(
      1,
      1,
      expect.objectContaining({ episodeNumber: 1 }),
    );
  });
});
