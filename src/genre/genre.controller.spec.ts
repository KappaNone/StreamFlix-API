import { Test, TestingModule } from '@nestjs/testing';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

describe('GenreController', () => {
  let controller: GenreController;
  let service: GenreService;

  const mockGenreService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenreController],
      providers: [
        {
          provide: GenreService,
          useValue: mockGenreService,
        },
      ],
    }).compile();

    controller = module.get<GenreController>(GenreController);
    service = module.get<GenreService>(GenreService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre', async () => {
      const createGenreDto: CreateGenreDto = {
        name: 'Action',
      };
      const expectedResult = { id: 1, name: 'Action', createdAt: new Date(), updatedAt: new Date() };
      mockGenreService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createGenreDto);

      expect(service.create).toHaveBeenCalledWith(createGenreDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all genres', async () => {
      const expectedResult = [{ id: 1, name: 'Action' }];
      mockGenreService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a genre by id', async () => {
      const id = 1;
      const expectedResult = { id: 1, name: 'Action' };
      mockGenreService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id.toString());

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if service fails', async () => {
      const id = 1;
      mockGenreService.findOne.mockRejectedValue(new Error('Genre with id 1 not found'));

      await expect(controller.findOne(id.toString())).rejects.toThrow('Genre with id 1 not found');
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      const id = 1;
      const updateGenreDto: UpdateGenreDto = {
        name: 'Updated Action',
      };
      const expectedResult = { id: 1, name: 'Updated Action' };
      mockGenreService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id.toString(), updateGenreDto);

      expect(service.update).toHaveBeenCalledWith(id, updateGenreDto);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if service fails', async () => {
      const id = 1;
      const updateGenreDto: UpdateGenreDto = {
        name: 'Updated Action',
      };
      mockGenreService.update.mockRejectedValue(new Error('Genre with id 1 not found'));

      await expect(controller.update(id.toString(), updateGenreDto)).rejects.toThrow('Genre with id 1 not found');
      expect(service.update).toHaveBeenCalledWith(id, updateGenreDto);
    });
  });

  describe('remove', () => {
    it('should remove a genre', async () => {
      const id = 1;
      const expectedResult = { id: 1, name: 'Action' };
      mockGenreService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(id.toString());

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });

    it('should throw error if service fails', async () => {
      const id = 1;
      mockGenreService.remove.mockRejectedValue(new Error('Genre with id 1 not found'));

      await expect(controller.remove(id.toString())).rejects.toThrow('Genre with id 1 not found');
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});