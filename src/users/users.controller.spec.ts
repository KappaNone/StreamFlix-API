import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { findAll: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll maps users to UserEntity', async () => {
    usersService.findAll.mockResolvedValue([
      {
        id: 1,
        email: 'a@b.com',
        password: 'x',
        createdAt: new Date(),
        updatedAt: new Date(),
        name: null,
        referralDiscountUsed: false,
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        failedLoginAttempts: 0,
        accountLockedUntil: null,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
        isActive: true,
      },
    ]);

    const result = await controller.findAll();

    expect(usersService.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('id', 1);
    expect(result[0]).toHaveProperty('email', 'a@b.com');
  });
});
