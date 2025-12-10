import { Test, TestingModule } from '@nestjs/testing';
import { MovieEpisodeController, SeriesEpisodeController } from './episode.controller';
import { EpisodeService } from './episode.service';

describe('MovieEpisodeController', () => {
  let controller: MovieEpisodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieEpisodeController],
      providers: [EpisodeService],
    }).compile();

    controller = module.get<MovieEpisodeController>(MovieEpisodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

describe('SeriesEpisodeController', () => {
  let controller: SeriesEpisodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeriesEpisodeController],
      providers: [EpisodeService],
    }).compile();

    controller = module.get<SeriesEpisodeController>(SeriesEpisodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});