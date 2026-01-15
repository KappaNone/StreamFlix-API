import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { isContentAllowedFor, allowedTagsFor } from '../utils/age-classification';

@Controller('profiles')
export class ProfilesController {
  constructor(private svc: ProfilesService) {}

  @Post(':userId')
  create(@Param('userId', ParseIntPipe) userId: number, @Body() dto: CreateProfileDto) {
    return this.svc.create(userId, dto);
  }

  @Get('user/:userId')
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.svc.findAllByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProfileDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @Get(':id/allowed-tags')
  async allowedTags(@Param('id', ParseIntPipe) id: number) {
    const p = await this.svc.findOne(id);
    if (!p) return { error: 'Profile not found' };
    return { ageCategory: p.ageCategory, allowedTags: allowedTagsFor(p.ageCategory) };
  }

  @Post(':id/filter')
  async filter(@Param('id', ParseIntPipe) id: number, @Body('contentTags') contentTags: string[]) {
    const p = await this.svc.findOne(id);
    if (!p) return { error: 'Profile not found' };
    const allowed = isContentAllowedFor(p.ageCategory, contentTags || []);
    return { profileId: id, ageCategory: p.ageCategory, requestedTags: contentTags, allowed };
  }
}