import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfilePreferenceDto } from './dto/create-profile-preference.dto';
import { UpdateProfilePreferenceDto } from './dto/update-profile-preference.dto';
import { ProfilePreference } from './entity/profile-preference.entity';

@Injectable()
export class ProfilePreferenceService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProfilePreferenceDto) {
    const profile = await this.prisma.profile.findUnique({ where: { id: dto.profileId } });
    if (!profile) {
      throw new NotFoundException(`Profile with id ${dto.profileId} not found`);
    }
    return this.prisma.profilePreference.create({ data: dto });
  }

  findAll() {
    return this.prisma.profilePreference.findMany();
  }

  async findOne(id: number) {
    const profilePreference = await this.prisma.profilePreference.findUnique({ where: { id } });
    if (!profilePreference) {
      throw new NotFoundException(`profilePreference ${id} not found`);
    }
    return profilePreference;
  }

  async findByProfile(profileId: number) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) {
      throw new NotFoundException(`Profile ${profileId} not found`);
    }
    return this.prisma.profilePreference.findMany({
      where: { profileId },
    });
  }

  async update(id: number, dto: UpdateProfilePreferenceDto) {
    const profilePreference = await this.prisma.profilePreference.findUnique({ where: { id } });
    if (!profilePreference) {
      throw new NotFoundException(`ProfilePreference ${id} not found`);
    }
    return this.prisma.profilePreference.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const profilePreference = await this.prisma.profilePreference.findUnique({ where: { id } });
    if (!profilePreference) {
      throw new NotFoundException(`ProfilePreference ${id} not found`);
    }
    return this.prisma.profilePreference.delete({
      where: { id },
    });
  }
}
