import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from './email.service';
import { NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
      create: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
            sendAccountLockedEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('throws NotFoundException when logging in with unknown email', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.login('missing@example.com', 'pw')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
