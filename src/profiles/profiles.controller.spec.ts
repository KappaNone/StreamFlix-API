import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AgeCategory, ContentTag } from '../utils/age-classification';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let service: ProfilesService;

  const mockProfilesService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        {
          provide: ProfilesService,
          useValue: mockProfilesService,
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
    service = module.get<ProfilesService>(ProfilesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a profile', async () => {
      const userId = 1;
      const createProfileDto: CreateProfileDto = {
        name: 'Kids Profile',
        ageCategory: 'ZERO' as any,
      };

      const expectedProfile = {
        id: 1,
        userId,
        ...createProfileDto,
      };

      mockProfilesService.create.mockResolvedValue(expectedProfile);

      const result = await controller.create(userId, createProfileDto);

      expect(result).toEqual(expectedProfile);
      expect(mockProfilesService.create).toHaveBeenCalledWith(userId, createProfileDto);
    });
  });

  describe('findByUser', () => {
    it('should find all profiles for a user', async () => {
      const userId = 1;
      const profiles = [
        { id: 1, userId, name: 'Profile 1', ageCategory: 'ZERO' },
        { id: 2, userId, name: 'Profile 2', ageCategory: 'THIRTEEN' },
      ];

      mockProfilesService.findAllByUser.mockResolvedValue(profiles);

      const result = await controller.findByUser(userId);

      expect(result).toEqual(profiles);
      expect(mockProfilesService.findAllByUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should find a profile by id', async () => {
      const profileId = 1;
      const profile = {
        id: profileId,
        userId: 1,
        name: 'Test Profile',
        ageCategory: 'THIRTEEN',
      };

      mockProfilesService.findOne.mockResolvedValue(profile);

      const result = await controller.findOne(profileId);

      expect(result).toEqual(profile);
      expect(mockProfilesService.findOne).toHaveBeenCalledWith(profileId);
    });
  });

  describe('update', () => {
    it('should update a profile', async () => {
      const profileId = 1;
      const updateProfileDto: UpdateProfileDto = {
        name: 'Updated Profile',
        ageCategory: 'EIGHTEEN' as any,
      };

      const updatedProfile = {
        id: profileId,
        userId: 1,
        ...updateProfileDto,
      };

      mockProfilesService.update.mockResolvedValue(updatedProfile);

      const result = await controller.update(profileId, updateProfileDto);

      expect(result).toEqual(updatedProfile);
      expect(mockProfilesService.update).toHaveBeenCalledWith(profileId, updateProfileDto);
    });
  });

  describe('remove', () => {
    it('should delete a profile', async () => {
      const profileId = 1;
      const deletedProfile = {
        id: profileId,
        userId: 1,
        name: 'Deleted Profile',
        ageCategory: 'ZERO',
      };

      mockProfilesService.remove.mockResolvedValue(deletedProfile);

      const result = await controller.remove(profileId);

      expect(result).toEqual(deletedProfile);
      expect(mockProfilesService.remove).toHaveBeenCalledWith(profileId);
    });
  });

  describe('allowedTags', () => {
    it('should return allowed tags for a profile', async () => {
      const profileId = 1;
      const profile = {
        id: profileId,
        userId: 1,
        name: 'Kids Profile',
        ageCategory: 'ZERO',
      };

      mockProfilesService.findOne.mockResolvedValue(profile);

      const result = await controller.allowedTags(profileId);

      expect(result).toHaveProperty('ageCategory');
      expect(result).toHaveProperty('allowedTags');
      expect(mockProfilesService.findOne).toHaveBeenCalledWith(profileId);
    });

    it('should return error if profile not found', async () => {
      const profileId = 999;
      mockProfilesService.findOne.mockResolvedValue(null);

      const result = await controller.allowedTags(profileId);

      expect(result).toEqual({ error: 'Profile not found' });
    });
  });

  describe('filter', () => {
    it('should filter content based on profile age category', async () => {
      const profileId = 1;
      const profile = {
        id: profileId,
        userId: 1,
        name: 'Kids Profile',
        ageCategory: 'ZERO',
      };

      const contentTags = ['none'];

      mockProfilesService.findOne.mockResolvedValue(profile);

      const result = await controller.filter(profileId, contentTags);

      expect(result).toHaveProperty('profileId', profileId);
      expect(result).toHaveProperty('ageCategory');
      expect(result).toHaveProperty('requestedTags');
      expect(result).toHaveProperty('allowed');
      expect(mockProfilesService.findOne).toHaveBeenCalledWith(profileId);
    });

    it('should return error if profile not found', async () => {
      const profileId = 999;
      mockProfilesService.findOne.mockResolvedValue(null);

      const result = await controller.filter(profileId, ['violence']);

      expect(result).toEqual({ error: 'Profile not found' });
    });

    it('should handle empty content tags', async () => {
      const profileId = 1;
      const profile = {
        id: profileId,
        userId: 1,
        name: 'Teen Profile',
        ageCategory: 'THIRTEEN',
      };

      mockProfilesService.findOne.mockResolvedValue(profile);

      const result = await controller.filter(profileId, []);

      expect(result).toHaveProperty('allowed');
      expect(mockProfilesService.findOne).toHaveBeenCalledWith(profileId);
    });
  });
});
