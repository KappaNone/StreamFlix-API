import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenreService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateGenreDto) {
    return this.prisma.genre.create({ data: dto });
  }

  findAll() {
    return this.prisma.genre.findMany();
  }

  async findOne(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
    });
    if (!genre) {
      throw new NotFoundException(`Genre with id ${id} not found`);
    }
    return genre;
  }

  async update(id: number, dto: UpdateGenreDto) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
    });
    if (!genre) {
      throw new NotFoundException(`Genre with id ${id} not found`);
    }
    return this.prisma.genre.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const genre = await this.prisma.genre.findUnique({
      where: { id },
    });
    if (!genre) {
      throw new NotFoundException(`Genre with id ${id} not found`);
    }
    return this.prisma.genre.delete({
      where: { id },
    });
  }
}