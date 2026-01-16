import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiOkResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { isContentAllowedFor, allowedTagsFor, AgeCategory, ContentTag } from '../utils/age-classification';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private svc: ProfilesService) {}

  @Post(':userId')
  @ApiOperation({ summary: 'Create a new profile for a user' })
  @ApiParam({ name: 'userId', type: 'number', description: 'User ID' })
  @ApiBody({ type: CreateProfileDto })
  @ApiCreatedResponse({ description: 'Profile created successfully' })
  @ApiBadRequestResponse({ description: 'Invalid input' })
  create(@Param('userId', ParseIntPipe) userId: number, @Body() dto: CreateProfileDto) {
    return this.svc.create(userId, dto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all profiles for a user' })
  @ApiParam({ name: 'userId', type: 'number', description: 'User ID' })
  @ApiOkResponse({ description: 'List of profiles' })
  @ApiNotFoundResponse({ description: 'User not found' })
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.svc.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a profile by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Profile ID' })
  @ApiOkResponse({ description: 'Profile found' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a profile' })
  @ApiParam({ name: 'id', type: 'number', description: 'Profile ID' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({ description: 'Profile updated successfully' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProfileDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a profile' })
  @ApiParam({ name: 'id', type: 'number', description: 'Profile ID' })
  @ApiOkResponse({ description: 'Profile deleted successfully' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }

  @Get(':id/allowed-tags')
  @ApiOperation({ summary: 'Get allowed content tags for a profile based on age category' })
  @ApiParam({ name: 'id', type: 'number', description: 'Profile ID' })
  @ApiOkResponse({ description: 'Allowed content tags' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  async allowedTags(@Param('id', ParseIntPipe) id: number) {
    const p = await this.svc.findOne(id);
    if (!p) return { error: 'Profile not found' };
    const ageCategory = p.ageCategory as unknown as AgeCategory;
    return { ageCategory: p.ageCategory, allowedTags: allowedTagsFor(ageCategory) };
  }

  @Post(':id/filter')
  @ApiOperation({ summary: 'Check if content tags are allowed for a profile' })
  @ApiParam({ name: 'id', type: 'number', description: 'Profile ID' })
  @ApiBody({ schema: { type: 'object', properties: { contentTags: { type: 'array', items: { type: 'string' }, description: 'Content tags to filter' } } } })
  @ApiOkResponse({ description: 'Content filter result' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  async filter(@Param('id', ParseIntPipe) id: number, @Body('contentTags') contentTags: string[]) {
    const p = await this.svc.findOne(id);
    if (!p) return { error: 'Profile not found' };
    const ageCategory = p.ageCategory as unknown as AgeCategory;
    const allowed = isContentAllowedFor(ageCategory, (contentTags || []) as ContentTag[]);
    return { profileId: id, ageCategory: p.ageCategory, requestedTags: contentTags, allowed };
  }
}