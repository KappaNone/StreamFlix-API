import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, dto: CreateProfileDto) {
    return this.prisma.profile.create({
      data: { userId, name: dto.name, ageCategory: dto.ageCategory, imageUrl: dto.imageUrl },
    });
  }

  findAllByUser(userId: number) {
    return this.prisma.profile.findMany({ where: { userId } });
  }

  findOne(id: number) {
    return this.prisma.profile.findUnique({ where: { id } });
  }

  update(id: number, dto: UpdateProfileDto) {
    return this.prisma.profile.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.profile.delete({ where: { id } });
  }
}