import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

async create(dto: CreateProfileDto) {
  return this.prisma.profile.create({
    data: {  
      name: dto.name,
      ageCategory: dto.ageCategory,
      userId: dto.userId,
    },
  });
}

  findAll() {
    return this.prisma.profile.findMany();
  }

  findOne(id: number) {
    return this.prisma.profile.findUnique({ where: { id } });
  }

  findByUser(userId: number) {
    return this.prisma.profile.findMany({ where: { userId } });
  }

  update(id: number, dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.profile.delete({ where: { id } });
  }
}
