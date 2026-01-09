import { Module } from '@nestjs/common';
import { ProfilePreferenceService } from './profile-preference.service';
import { ProfilePreferenceController } from './profile-preference.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProfilePreferenceController],
  providers: [ProfilePreferenceService, PrismaService],
})
export class ProfilePreferenceModule {}
