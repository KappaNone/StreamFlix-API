import { Test, TestingModule } from '@nestjs/testing';
import { QualityController } from './quality.controller';
import { QualityService } from './quality.service';

describe('QualityController', () => {
  let controller: QualityController;
  let qualityService: { findAll: jest.Mock };

  beforeEach(async () => {
    qualityService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QualityController],
      providers: [{ provide: QualityService, useValue: qualityService }],
    }).compile();

    controller = module.get<QualityController>(QualityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates findAll to QualityService', async () => {
    qualityService.findAll.mockResolvedValue([{ titleId: 1, name: 'HD' }]);

    await controller.findAll(1);

    expect(qualityService.findAll).toHaveBeenCalledWith(1);
  });
});
