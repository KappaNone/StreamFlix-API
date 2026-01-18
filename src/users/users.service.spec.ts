import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { user: { findMany: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll delegates to Prisma', async () => {
    prisma.user.findMany.mockResolvedValue([{ id: 1 }]);

    const users = await service.findAll();

    expect(prisma.user.findMany).toHaveBeenCalled();
    expect(users).toEqual([{ id: 1 }]);
  });
});
