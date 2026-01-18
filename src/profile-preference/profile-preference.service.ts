import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfilePreferenceDto } from './dto/create-profile-preference.dto';
import { UpdateProfilePreferenceDto } from './dto/update-profile-preference.dto';

@Injectable()
export class ProfilePreferenceService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProfilePreferenceDto) {
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

  findByProfile(profileId: number) {
    return this.prisma.profilePreference.findMany({
      where: { profileId },
    });
  }

  update(id: number, dto: UpdateProfilePreferenceDto) {
    return this.prisma.profilePreference.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prisma.profilePreference.delete({
      where: { id },
    });
  }
}
