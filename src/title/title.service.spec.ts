import { Test, TestingModule } from '@nestjs/testing';
import { TitleService } from './title.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TitlesService', () => {
  let service: TitleService;
  let prisma: { title: { findUnique: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      title: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TitleService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TitleService>(TitleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne throws NotFoundException when missing', async () => {
    prisma.title.findUnique.mockResolvedValue(null);
    await expect(service.findOne(123)).rejects.toBeInstanceOf(NotFoundException);
  });
});
