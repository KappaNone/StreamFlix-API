import { Injectable } from '@nestjs/common';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TitlesService {
  constructor(private prisma: PrismaService) {}

  create(createTitleDto: CreateTitleDto) {
    return this.prisma.title.create({
      data: createTitleDto,
    });
  }

  findAll() {
    return this.prisma.title.findMany();
  }

  findOne(id: number) {
    return this.prisma.title.findUniqueOrThrow({ where: { id } });
  }

  update(id: number, updateTitleDto: UpdateTitleDto) {
    return this.prisma.title.update({
      where: { id },
      data: updateTitleDto,
    });
  }

  remove(id: number) {
    return this.prisma.title.delete({ where: { id } });
  }
}
