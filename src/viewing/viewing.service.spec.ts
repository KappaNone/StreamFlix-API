import { Test, TestingModule } from '@nestjs/testing';
import { ViewingService } from './viewing.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('ViewingService', () => {
  let service: ViewingService;

  const prismaMock = {
    title: {
      findUnique: jest.fn(),
    },
    episode: {
      findUnique: jest.fn(),
    },
    viewingProgress: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    watchlist: {
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    prismaMock.title.findUnique.mockImplementation(async ({ where }: any) => ({
      id: where.id,
    }));
    prismaMock.episode.findUnique.mockResolvedValue(null);
    prismaMock.viewingProgress.upsert.mockImplementation(async ({ create, update }: any) => ({
      userId: create.userId,
      titleId: create.titleId,
      episodeId: create.episodeId ?? null,
      positionSeconds: update.positionSeconds ?? create.positionSeconds,
      totalDurationSeconds: update.totalDurationSeconds ?? create.totalDurationSeconds,
      isCompleted: update.isCompleted ?? create.isCompleted,
      autoPlayNextEpisode: update.autoPlayNextEpisode ?? create.autoPlayNextEpisode,
    }));
    prismaMock.viewingProgress.findMany.mockResolvedValue([]);
    prismaMock.viewingProgress.deleteMany.mockResolvedValue({ count: 0 });
    prismaMock.watchlist.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.watchlist.findUnique.mockResolvedValue(null);
    prismaMock.watchlist.upsert.mockImplementation(async ({ create }: any) => ({
      userId: create.userId,
      titleId: create.titleId,
      removedAt: null,
    }));
    prismaMock.watchlist.findMany.mockResolvedValue([]);
    prismaMock.watchlist.update.mockResolvedValue({});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViewingService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ViewingService>(ViewingService);
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
