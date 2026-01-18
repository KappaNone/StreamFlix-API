import { Test, TestingModule } from '@nestjs/testing';
import { GenreService } from './genre.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

describe('GenreService', () => {
  let service: GenreService;
  let prisma: {
    genre: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      genre: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenreService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<GenreService>(GenreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre', async () => {
      const dto: CreateGenreDto = { name: 'Action' };
      const createdGenre = { id: 1, name: 'Action' };
      prisma.genre.create.mockResolvedValue(createdGenre);

      const result = await service.create(dto);

      expect(prisma.genre.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(createdGenre);
    });
  });

  describe('findAll', () => {
    it('should return all genres', async () => {
      const genres = [{ id: 1, name: 'Action' }];
      prisma.genre.findMany.mockResolvedValue(genres);

      const result = await service.findAll();

      expect(prisma.genre.findMany).toHaveBeenCalled();
      expect(result).toEqual(genres);
    });
  });

  describe('findOne', () => {
    it('should return a genre by id', async () => {
      const id = 1;
      const genre = { id: 1, name: 'Action' };
      prisma.genre.findUnique.mockResolvedValue(genre);

      const result = await service.findOne(id);

      expect(prisma.genre.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(genre);
    });

    it('should throw NotFoundException if genre not found', async () => {
      const id = 1;
      prisma.genre.findUnique.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      const id = 1;
      const dto: UpdateGenreDto = { name: 'Updated Action' };
      const genre = { id: 1, name: 'Action' };
      const updatedGenre = { id: 1, name: 'Updated Action' };
      prisma.genre.findUnique.mockResolvedValue(genre);
      prisma.genre.update.mockResolvedValue(updatedGenre);

      const result = await service.update(id, dto);

      expect(prisma.genre.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prisma.genre.update).toHaveBeenCalledWith({ where: { id }, data: dto });
      expect(result).toEqual(updatedGenre);
    });

    it('should throw NotFoundException if genre not found', async () => {
      const id = 1;
      const dto: UpdateGenreDto = { name: 'Updated Action' };
      prisma.genre.findUnique.mockResolvedValue(null);

      await expect(service.update(id, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a genre', async () => {
      const id = 1;
      const genre = { id: 1, name: 'Action' };
      prisma.genre.findUnique.mockResolvedValue(genre);
      prisma.genre.delete.mockResolvedValue(genre);

      const result = await service.remove(id);

      expect(prisma.genre.findUnique).toHaveBeenCalledWith({ where: { id } });
      expect(prisma.genre.delete).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(genre);
    });

    it('should throw NotFoundException if genre not found', async () => {
      const id = 1;
      prisma.genre.findUnique.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});