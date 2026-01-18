import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateProfileDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if profile name already exists for this user
    const existingProfile = await this.prisma.profile.findFirst({
      where: { userId, name: dto.name },
    });
    if (existingProfile) {
      throw new BadRequestException(`Profile with name '${dto.name}' already exists for this user`);
    }

    return this.prisma.profile.create({
      data: { userId, name: dto.name, ageCategory: dto.ageCategory },
    });
  }

  async findAllByUser(userId: number) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.prisma.profile.findMany({ where: { userId } });
  }

  async findOne(id: number) {
    const profile = await this.prisma.profile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }
    return profile;
  }

  async update(id: number, dto: UpdateProfileDto) {
    // Check if profile exists
    const profile = await this.prisma.profile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    // If updating name, check for uniqueness
    if (dto.name) {
      const existingProfile = await this.prisma.profile.findFirst({
        where: { userId: profile.userId, name: dto.name, id: { not: id } },
      });
      if (existingProfile) {
        throw new BadRequestException(`Profile with name '${dto.name}' already exists for this user`);
      }
    }

    return this.prisma.profile.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    // Check if profile exists
    const profile = await this.prisma.profile.findUnique({ where: { id } });
    if (!profile) {
      throw new NotFoundException(`Profile with ID ${id} not found`);
    }

    return this.prisma.profile.delete({ where: { id } });
  }
}