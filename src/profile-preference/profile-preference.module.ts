import { Module } from '@nestjs/common';
import { ProfilePreferenceService } from './profile-preference.service';
import { ProfilePreferenceController } from './profile-preference.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ProfilePreferenceController],
  providers: [ProfilePreferenceService, PrismaService],
  imports: [PrismaModule, UsersModule],
  exports: [ProfilePreferenceModule],
})
export class ProfilePreferenceModule {}
