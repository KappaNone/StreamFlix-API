import { Test, TestingModule } from '@nestjs/testing';
import { ProfilePreferenceController } from './profile-preference.controller';
import { ProfilePreferenceService } from './profile-preference.service';
import { CreateProfilePreferenceDto } from './dto/create-profile-preference.dto';
import { UpdateProfilePreferenceDto } from './dto/update-profile-preference.dto';

describe('ProfilePreferenceController', () => {
  let controller: ProfilePreferenceController;
  let service: ProfilePreferenceService;

  const mockProfilePreferenceService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByProfile: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilePreferenceController],
      providers: [
        {
          provide: ProfilePreferenceService,
          useValue: mockProfilePreferenceService,
        },
      ],
    }).compile();

    controller = module.get<ProfilePreferenceController>(ProfilePreferenceController);
    service = module.get<ProfilePreferenceService>(ProfilePreferenceService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a profile preference', async () => {
      const createProfilePreferenceDto: CreateProfilePreferenceDto = {
        profileId: 1,
      };
      const expectedResult = { id: 1, profileId: 1, createdAt: new Date(), updatedAt: new Date() };
      mockProfilePreferenceService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createProfilePreferenceDto);

      expect(service.create).toHaveBeenCalledWith(createProfilePreferenceDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if service fails', async () => {
      const createProfilePreferenceDto: CreateProfilePreferenceDto = {
        profileId: 1,
      };
      mockProfilePreferenceService.create.mockRejectedValue(new Error('Profile not found'));

      await expect(controller.create(createProfilePreferenceDto)).rejects.toThrow('Profile not found');
      expect(service.create).toHaveBeenCalledWith(createProfilePreferenceDto);
    });
  });

  describe('findAll', () => {
    it('should return all profile preferences', async () => {
      const expectedResult = [{ id: 1, profileId: 1 }];
      mockProfilePreferenceService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a profile preference by id', async () => {
      const id = 1;
      const expectedResult = { id: 1, profileId: 1 };
      mockProfilePreferenceService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id.toString());

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if service fails', async () => {
      const id = 1;
      mockProfilePreferenceService.findOne.mockRejectedValue(new Error('ProfilePreference not found'));

      await expect(controller.findOne(id.toString())).rejects.toThrow('ProfilePreference not found');
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('findByProfile', () => {
    it('should return profile preferences by profile id', async () => {
      const profileId = 1;
      const expectedResult = [{ id: 1, profileId: 1 }];
      mockProfilePreferenceService.findByProfile.mockResolvedValue(expectedResult);

      const result = await controller.findByProfile(profileId.toString());

      expect(service.findByProfile).toHaveBeenCalledWith(profileId);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if service fails', async () => {
      const profileId = 1;
      mockProfilePreferenceService.findByProfile.mockRejectedValue(new Error('Profile not found'));

      await expect(controller.findByProfile(profileId.toString())).rejects.toThrow('Profile not found');
      expect(service.findByProfile).toHaveBeenCalledWith(profileId);
    });
  });

  describe('update', () => {
    it('should update a profile preference', async () => {
      const id = 1;
      const updateProfilePreferenceDto: UpdateProfilePreferenceDto = {
        profileId: 2,
      };
      const expectedResult = { id: 1, profileId: 2 };
      mockProfilePreferenceService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id.toString(), updateProfilePreferenceDto);

      expect(service.update).toHaveBeenCalledWith(id, updateProfilePreferenceDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if service fails', async () => {
      const id = 1;
      const updateProfilePreferenceDto: UpdateProfilePreferenceDto = {
        profileId: 2,
      };
      mockProfilePreferenceService.update.mockRejectedValue(new Error('ProfilePreference not found'));

      await expect(controller.update(id.toString(), updateProfilePreferenceDto)).rejects.toThrow('ProfilePreference not found');
      expect(service.update).toHaveBeenCalledWith(id, updateProfilePreferenceDto);
    });
  });

  describe('remove', () => {
    it('should remove a profile preference', async () => {
      const id = 1;
      const expectedResult = { id: 1, profileId: 1 };
      mockProfilePreferenceService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id.toString());

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if service fails', async () => {
      const id = 1;
      mockProfilePreferenceService.remove.mockRejectedValue(new Error('ProfilePreference not found'));

      await expect(controller.remove(id.toString())).rejects.toThrow('ProfilePreference not found');
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});