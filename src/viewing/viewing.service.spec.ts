import { Test, TestingModule } from '@nestjs/testing';
import { ViewingService } from './viewing.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ViewingService', () => {
  let service: ViewingService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ViewingService, PrismaService],
    }).compile();

    service = module.get<ViewingService>(ViewingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordViewing', () => {
    it('should create new viewing progress', async () => {
      const userId = 1;
      const titleId = 1;
      const dto = {
        titleId,
        positionSeconds: 1500,
        totalDurationSeconds: 7200,
        isCompleted: false,
      };

      const result = await service.recordViewing(userId, dto);
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.titleId).toBe(titleId);
    });

    it('should update existing viewing progress', async () => {
      const userId = 1;
      const titleId = 1;
      const dto = {
        titleId,
        positionSeconds: 3000,
        totalDurationSeconds: 7200,
        isCompleted: true,
      };

      const result = await service.recordViewing(userId, dto);
      expect(result.positionSeconds).toBe(3000);
      expect(result.isCompleted).toBe(true);
    });
  });

  describe('addToWatchlist', () => {
    it('should add title to watchlist', async () => {
      const userId = 1;
      const dto = { titleId: 1 };

      const result = await service.addToWatchlist(userId, dto);
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.titleId).toBe(1);
      expect(result.removedAt).toBeNull();
    });
  });

  describe('getWatchlist', () => {
    it('should return user watchlist', async () => {
      const userId = 1;

      const result = await service.getWatchlist(userId);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getContinueWatching', () => {
    it('should return incomplete viewing progress', async () => {
      const userId = 1;

      const result = await service.getContinueWatching(userId);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getRecentlyCompleted', () => {
    it('should return completed viewing progress', async () => {
      const userId = 1;

      const result = await service.getRecentlyCompleted(userId);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
