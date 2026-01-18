import { Test, TestingModule } from '@nestjs/testing';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';

describe('SeasonController', () => {
  let controller: SeasonController;
  let seasonService: { findOneByNumber: jest.Mock };

  beforeEach(async () => {
    seasonService = {
      findOneByNumber: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeasonController],
      providers: [{ provide: SeasonService, useValue: seasonService }],
    }).compile();

    controller = module.get<SeasonController>(SeasonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates findOne to SeasonService', async () => {
    seasonService.findOneByNumber.mockResolvedValue({ id: 1 });

    await controller.findOne(1, 2);

    expect(seasonService.findOneByNumber).toHaveBeenCalledWith(1, 2);
  });
});
