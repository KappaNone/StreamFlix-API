import { Test, TestingModule } from '@nestjs/testing';
import { ViewingController } from './viewing.controller';
import { ViewingService } from './viewing.service';

describe('ViewingController', () => {
  let controller: ViewingController;
  let service: ViewingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViewingController],
      providers: [
        {
          provide: ViewingService,
          useValue: {
            recordViewing: jest.fn(),
            getViewingProgress: jest.fn(),
            getUserViewingHistory: jest.fn(),
            addToWatchlist: jest.fn(),
            getWatchlist: jest.fn(),
            removeFromWatchlist: jest.fn(),
            getContinueWatching: jest.fn(),
            getRecentlyCompleted: jest.fn(),
            clearViewingProgress: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ViewingController>(ViewingController);
    service = module.get<ViewingService>(ViewingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('recordViewing', () => {
    it('should call viewingService.recordViewing', () => {
      const req = { user: { id: 1 } };
      const dto = {
        titleId: 1,
        positionSeconds: 1500,
        totalDurationSeconds: 7200,
        isCompleted: false,
      };

      controller.recordViewing(req, dto);
      expect(service.recordViewing).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('addToWatchlist', () => {
    it('should call viewingService.addToWatchlist', () => {
      const req = { user: { id: 1 } };
      const dto = { titleId: 1 };

      controller.addToWatchlist(req, dto);
      expect(service.addToWatchlist).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('getWatchlist', () => {
    it('should call viewingService.getWatchlist', () => {
      const req = { user: { id: 1 } };

      controller.getWatchlist(req);
      expect(service.getWatchlist).toHaveBeenCalledWith(1);
    });
  });
});
