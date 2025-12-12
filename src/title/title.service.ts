import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TitleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTitleDto: CreateTitleDto) {
    return await this.prisma.title.create({
      data: createTitleDto,
    });
  }

  async findAll() {
    return await this.prisma.title.findMany();
  }

  async findOne(id: number) {
    const title = await this.prisma.title.findUnique({ where: { id } });
    if (!title) {
      throw new NotFoundException(`Title ${id} not found`);
    }
    return title;
  }

  async update(id: number, updateTitleDto: UpdateTitleDto) {
    return await this.prisma.title.update({
      where: { id },
      data: updateTitleDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.title.delete({ where: { id } });
  }
}
