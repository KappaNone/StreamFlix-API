import { Test, TestingModule } from '@nestjs/testing';
import { TitleController } from './title.controller';
import { TitleService } from './title.service';

describe('TitlesController', () => {
  let controller: TitleController;
  let titleService: { findOne: jest.Mock };

  beforeEach(async () => {
    titleService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TitleController],
      providers: [{ provide: TitleService, useValue: titleService }],
    }).compile();

    controller = module.get<TitleController>(TitleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates findOne to TitleService', async () => {
    titleService.findOne.mockResolvedValue({ id: 1 });

    await controller.findOne(1);

    expect(titleService.findOne).toHaveBeenCalledWith(1);
  });
});
