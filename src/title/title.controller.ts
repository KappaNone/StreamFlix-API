import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { TitleService } from './title.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TitleEntity } from './entities/title.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { EpisodeService } from 'src/episode/episode.service';
import { EpisodeEntity } from 'src/episode/entities/episode.entity';
import { CreateEpisodeDto } from 'src/episode/dto/create-episode.dto';
import { TitleType } from '@prisma/client';

@Controller('title')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
@ApiTags('title')
export class TitleController {
  constructor(private readonly titleService: TitleService) {}

  @Post()
  @ApiCreatedResponse({ type: TitleEntity })
  async create(@Body() createTitleDto: CreateTitleDto) {
    return new TitleEntity(await this.titleService.create(createTitleDto));
  }                       

  @Get()
  @ApiOkResponse({ type: TitleEntity, isArray: true })
  findAll() {
    return this.titleService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TitleEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.titleService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: TitleEntity })
  update(@Param('id', ParseIntPipe) id: string, @Body() updateTitleDto: UpdateTitleDto) {
    return this.titleService.update(+id, updateTitleDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TitleEntity })
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.titleService.remove(+id);
  }

  

  // @Post(':id')
  // @ApiCreatedResponse({ type: EpisodeEntity })
  // async createEpisodeForMovie(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateEpisodeDto) {
  //   const title = await this.titleService.findOne(id);

  //   if (title.type !== TitleType.MOVIE) {
  //     throw new BadRequestException(`Cannot add episode to title of type ${title.type}, try /title/:id/season instead`);
  //   }

  //   return this.episodeService.create(id, null, dto);
  // }

  // @Get(':id')
  // @ApiOkResponse({ type: EpisodeEntity })
  // async findEpisodeForMovie(@Param('id', ParseIntPipe) id: number) {
  //   const title = await this.titleService.findOne(id);

  //   if (title.type !== TitleType.MOVIE) {
  //     throw new BadRequestException(`Title ${id} is of type ${title.type}, try /title/:id/season instead`);
  //   }

  //   return 
  // }

  // @Patch(':id')
  // @ApiOkResponse({ type: EpisodeEntity })
  // updateEpisodeForMovie(@Param('id', ParseIntPipe) id: string, @Body() updateTitleDto: UpdateTitleDto) {
  //   return this.titleService.update(+id, updateTitleDto);
  // }

  // @Delete(':id')
  // @ApiOkResponse({ type: EpisodeEntity })
  // removeEpisodeForMovie(@Param('id', ParseIntPipe) id: string) {
  //   return this.titleService.remove(+id);
  // }
}
