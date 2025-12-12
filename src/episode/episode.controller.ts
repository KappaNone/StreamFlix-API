import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { EpisodeService } from './episode.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { UpdateEpisodeDto } from './dto/update-episode.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EpisodeEntity } from './entities/episode.entity';

@Controller('title/:titleId/season/:seasonNumber/episode')
@ApiTags('Series Episode')
export class SeriesEpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Post()
  @ApiCreatedResponse({ type: EpisodeEntity })
  create(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
    @Body() createEpisodeDto: CreateEpisodeDto,
  ) {
    return this.episodeService.create(titleId, seasonNumber, createEpisodeDto);
  }

  @Get()
  @ApiOkResponse({ type: EpisodeEntity, isArray: true })
  findAll(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
  ) {
    return this.episodeService.findAll(titleId, seasonNumber);
  }

  @Get(':episodeNumber')
  @ApiOkResponse({ type: EpisodeEntity })
  findOne(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
    @Param('episodeNumber', ParseIntPipe) episodeNumber: number,
  ) {
    return this.episodeService.findOne(titleId, seasonNumber, episodeNumber);
  }

  @Patch(':episodeNumber')
  @ApiOkResponse({ type: EpisodeEntity })
  update(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
    @Param('episodeNumber', ParseIntPipe) episodeNumber: number,
    @Body() updateEpisodeDto: UpdateEpisodeDto,
  ) {
    return this.episodeService.update(
      titleId,
      seasonNumber,
      episodeNumber,
      updateEpisodeDto,
    );
  }

  @Delete(':episodeNumber')
  @ApiOkResponse({ type: EpisodeEntity })
  remove(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
    @Param('episodeNumber', ParseIntPipe) episodeNumber: number,
  ) {
    return this.episodeService.remove(titleId, seasonNumber, episodeNumber);
  }
}

@Controller('title/:titleId/episode')
@ApiTags('Movie Episode')
export class MovieEpisodeController {
  constructor(private readonly episodeService: EpisodeService) {}

  @Post()
  @ApiCreatedResponse({ type: EpisodeEntity })
  create(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Body() createEpisodeDto: CreateEpisodeDto,
  ) {
    return this.episodeService.create(titleId, null, createEpisodeDto);
  }

  @Get()
  @ApiOkResponse({ type: EpisodeEntity })
  findOne(@Param('titleId', ParseIntPipe) titleId: number) {
    return this.episodeService.findOne(titleId, null, null);
  }

  @Patch()
  @ApiOkResponse({ type: EpisodeEntity })
  update(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Body() updateEpisodeDto: UpdateEpisodeDto,
  ) {
    return this.episodeService.update(titleId, null, null, updateEpisodeDto);
  }

  @Delete()
  @ApiOkResponse({ type: EpisodeEntity })
  remove(@Param('titleId', ParseIntPipe) titleId: number) {
    return this.episodeService.remove(titleId, null, null);
  }
}
