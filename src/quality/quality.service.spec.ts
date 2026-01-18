import { Test, TestingModule } from '@nestjs/testing';
import { QualityService } from './quality.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TitleService } from 'src/title/title.service';
import { NotFoundException } from '@nestjs/common';
import { QualityName } from '@prisma/client';

describe('QualityService', () => {
  let service: QualityService;
  let prisma: { quality: { findFirst: jest.Mock } };
  let titleService: { findOne: jest.Mock };

  beforeEach(async () => {
    prisma = {
      quality: {
        findFirst: jest.fn(),
      },
    };
    titleService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QualityService,
        { provide: PrismaService, useValue: prisma },
        { provide: TitleService, useValue: titleService },
      ],
    }).compile();

    service = module.get<QualityService>(QualityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne throws NotFoundException when quality missing', async () => {
    titleService.findOne.mockResolvedValue({ id: 1 });
    prisma.quality.findFirst.mockResolvedValue(null);

    await expect(service.findOne(1, QualityName.HD)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
