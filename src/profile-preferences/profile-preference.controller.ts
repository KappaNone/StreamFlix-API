import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProfilePreferenceService } from './profile-preference.service';
import { CreateProfilePreferenceDto } from './dto/create-profile-preference.dto';
import { UpdateProfilePreferenceDto } from './dto/update-profile-preference.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Profile Preferences')
@Controller('profile-preferences')
export class ProfilePreferenceController {
  constructor(
    private readonly profilePreferenceService: ProfilePreferenceService,
  ) {}

  @Post()
  create(@Body() dto: CreateProfilePreferenceDto) {
    return this.profilePreferenceService.create(dto);
  }

  @Get()
  findAll() {
    return this.profilePreferenceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profilePreferenceService.findOne(+id);
  }

  @Get('profile/:profileId')
  findByProfile(@Param('profileId') profileId: string) {
    return this.profilePreferenceService.findByProfile(+profileId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProfilePreferenceDto,
  ) {
    return this.profilePreferenceService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profilePreferenceService.remove(+id);
  }
}
