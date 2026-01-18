import { Test, TestingModule } from '@nestjs/testing';
import { SeasonService } from './season.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('SeasonService', () => {
  let service: SeasonService;
  let prisma: { title: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      title: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [SeasonService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<SeasonService>(SeasonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findSeriesTitleOrThrow throws NotFoundException when title missing', async () => {
    prisma.title.findUnique.mockResolvedValue(null);
    await expect(service.findSeriesTitleOrThrow(999)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
