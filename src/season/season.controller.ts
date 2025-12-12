import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { SeasonService } from './season.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { ApiTags, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { SeasonEntity } from './entities/season.entity';

@Controller('title/:titleId/season')
@ApiTags('season')
export class SeasonController {
  constructor(private readonly service: SeasonService) {}

  @Post()
  @ApiCreatedResponse({ type: SeasonEntity })
  create(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Body() dto: CreateSeasonDto,
  ) {
    return this.service.create(titleId, dto);
  }

  @Get()
  @ApiOkResponse({ type: SeasonEntity, isArray: true })
  findAll(@Param('titleId', ParseIntPipe) titleId: number) {
    return this.service.findAllByTitle(titleId);
  }

  @Get(':seasonNumber')
  @ApiOkResponse({ type: SeasonEntity })
  findOne(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
  ) {
    return this.service.findOneByNumber(titleId, seasonNumber);
  }

  @Patch(':seasonNumber')
  @ApiOkResponse({ type: SeasonEntity })
  update(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
    @Body() dto: UpdateSeasonDto,
  ) {
    return this.service.updateByNumber(titleId, seasonNumber, dto);
  }

  @Delete(':seasonNumber')
  @ApiOkResponse({ type: SeasonEntity })
  remove(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('seasonNumber', ParseIntPipe) seasonNumber: number,
  ) {
    return this.service.removeByNumber(titleId, seasonNumber);
  }
}
