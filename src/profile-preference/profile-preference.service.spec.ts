import { Test, TestingModule } from '@nestjs/testing';
import { ProfilePreferenceService } from './profile-preference.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateProfilePreferenceDto } from './dto/create-profile-preference.dto';
import { UpdateProfilePreferenceDto } from './dto/update-profile-preference.dto';

describe('ProfilePreferenceService', () => {
  let service: ProfilePreferenceService;
  let prisma: {
    profile: {
      findUnique: jest.Mock;
    };
    profilePreference: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      profile: {
        findUnique: jest.fn(),
      },
      profilePreference: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilePreferenceService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProfilePreferenceService>(ProfilePreferenceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a profile preference', async () => {
      const dto: CreateProfilePreferenceDto = { profileId: 1 };
      const profile = { id: 1, name: 'Test Profile' };
      const createdPreference = { id: 1, profileId: 1 };

      prisma.profile.findUnique.mockResolvedValue(profile);
      prisma.profilePreference.create.mockResolvedValue(createdPreference);

      const result = await service.create(dto);

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({ where: { id: dto.profileId } });
      expect(prisma.profilePreference.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(createdPreference);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const dto: CreateProfilePreferenceDto = { profileId: 1 };

      prisma.profile.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all profile preferences', async () => {
      const preferences = [{ id: 1, profileId: 1 }];
      prisma.profilePreference.findMany.mockResolvedValue(preferences);

      const result = await service.findAll();

      expect(prisma.profilePreference.findMany).toHaveBeenCalled();
      expect(result).toEqual(preferences);
    });
  });

  describe('findOne', () => {
    it('should return a profile preference by id', async () => {
      const id = 1;
      const preference = { id: 1, profileId: 1 };
      prisma.profilePreference.findUnique.mockResolvedValue(preference);

      const result = await service.findOne(id);

      expect(prisma.profilePreference.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(preference);
    });

    it('should throw NotFoundException if profile preference not found', async () => {
      const id = 1;
      prisma.profilePreference.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProfile', () => {
    it('should return profile preferences by profile id', async () => {
      const profileId = 1;
      const profile = { id: 1, name: 'Test Profile' };
      const preferences = [{ id: 1, profileId: 1 }];
      prisma.profile.findUnique.mockResolvedValue(profile);
      prisma.profilePreference.findMany.mockResolvedValue(preferences);

      const result = await service.findByProfile(profileId);

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({ where: { id: profileId } });
      expect(prisma.profilePreference.findMany).toHaveBeenCalledWith({ where: { profileId } });
      expect(result).toEqual(preferences);
    });

    it('should throw NotFoundException if profile not found', async () => {
      const profileId = 1;
      prisma.profile.findUnique.mockResolvedValue(null);

      await expect(service.findByProfile(profileId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a profile preference', async () => {
      const id = 1;
      const dto: UpdateProfilePreferenceDto = { profileId: 2 };
      const preference = { id: 1, profileId: 1 };
      const updatedPreference = { id: 1, profileId: 2 };
      prisma.profilePreference.findUnique.mockResolvedValue(preference);
      prisma.profilePreference.update.mockResolvedValue(updatedPreference);

      const result = await service.update(id, dto);

      expect(prisma.profilePreference.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prisma.profilePreference.update).toHaveBeenCalledWith({ where: { id }, data: dto });
      expect(result).toEqual(updatedPreference);
    });

    it('should throw NotFoundException if profile preference not found', async () => {
      const id = 1;
      const dto: UpdateProfilePreferenceDto = { profileId: 2 };
      prisma.profilePreference.findUnique.mockResolvedValue(null);

      await expect(service.update(id, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a profile preference', async () => {
      const id = 1;
      const preference = { id: 1, profileId: 1 };
      prisma.profilePreference.findUnique.mockResolvedValue(preference);
      prisma.profilePreference.delete.mockResolvedValue(preference);

      const result = await service.remove(id);

      expect(prisma.profilePreference.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prisma.profilePreference.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(preference);
    });

    it('should throw NotFoundException if profile preference not found', async () => {
      const id = 1;
      prisma.profilePreference.findUnique.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});