import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AgeCategory } from '@prisma/client';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
    };
    profile: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      profile: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a profile successfully', async () => {
      const userId = 1;
      const dto = { name: 'Test Profile', ageCategory: AgeCategory.ALL };
      const createdProfile = { id: 1, ...dto, userId };

      prisma.user.findUnique.mockResolvedValue({ id: userId });
      prisma.profile.findFirst.mockResolvedValue(null);
      prisma.profile.create.mockResolvedValue(createdProfile);

      const result = await service.create(userId, dto);
      expect(result).toEqual(createdProfile);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.create(1, { name: 'Test', ageCategory: AgeCategory.ALL })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequestException if profile name already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 1 });
      prisma.profile.findFirst.mockResolvedValue({ id: 2, name: 'Test' });

      await expect(service.create(1, { name: 'Test', ageCategory: AgeCategory.ALL })).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findAllByUser', () => {
    it('should return profiles for user', async () => {
      const userId = 1;
      const profiles = [{ id: 1, name: 'Profile1', userId }];

      prisma.user.findUnique.mockResolvedValue({ id: userId });
      prisma.profile.findMany.mockResolvedValue(profiles);

      const result = await service.findAllByUser(userId);
      expect(result).toEqual(profiles);
    });

    it('should throw NotFoundException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findAllByUser(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return profile if found', async () => {
      const profile = { id: 1, name: 'Test' };
      prisma.profile.findUnique.mockResolvedValue(profile);

      const result = await service.findOne(1);
      expect(result).toEqual(profile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update profile successfully', async () => {
      const profile = { id: 1, name: 'Old', userId: 1 };
      const dto = { name: 'New' };
      const updatedProfile = { ...profile, ...dto };

      prisma.profile.findUnique.mockResolvedValue(profile);
      prisma.profile.findFirst.mockResolvedValue(null);
      prisma.profile.update.mockResolvedValue(updatedProfile);

      const result = await service.update(1, dto);
      expect(result).toEqual(updatedProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      await expect(service.update(1, { name: 'New' })).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequestException if new name already exists', async () => {
      const profile = { id: 1, userId: 1 };
      prisma.profile.findUnique.mockResolvedValue(profile);
      prisma.profile.findFirst.mockResolvedValue({ id: 2 });

      await expect(service.update(1, { name: 'Existing' })).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should delete profile successfully', async () => {
      const profile = { id: 1 };
      prisma.profile.findUnique.mockResolvedValue(profile);
      prisma.profile.delete.mockResolvedValue(profile);

      const result = await service.remove(1);
      expect(result).toEqual(profile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});