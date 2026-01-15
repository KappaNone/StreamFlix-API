import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import { QualityService } from './quality.service';
import { CreateQualityDto } from './dto/create-quality.dto';
import { UpdateQualityDto } from './dto/update-quality.dto';
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { QualityEntity } from './entities/quality.entity';
import { QualityName } from '@prisma/client';

@Controller('title/:titleId/quality')
@ApiTags('quality')
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Post()
  @ApiCreatedResponse({ type: QualityEntity })
  create(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Body() createQualityDto: CreateQualityDto,
  ) {
    return this.qualityService.create(titleId, createQualityDto);
  }

  @Get()
  @ApiOkResponse({ type: QualityEntity, isArray: true })
  findAll(@Param('titleId', ParseIntPipe) titleId: number) {
    return this.qualityService.findAll(titleId);
  }

  @Get(':qualityName')
  @ApiOkResponse({ type: QualityEntity })
  findOne(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('qualityName', new ParseEnumPipe(QualityName)) name: QualityName,
  ) {
    return this.qualityService.findOne(titleId, name);
  }

  @Patch(':qualityName')
  @ApiOkResponse({ type: QualityEntity })
  update(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('qualityName', new ParseEnumPipe(QualityName)) name: QualityName,
    @Body() updateQualityDto: UpdateQualityDto,
  ) {
    return this.qualityService.update(titleId, name, updateQualityDto);
  }

  @Delete(':qualityName')
  @ApiOkResponse({ type: QualityEntity })
  remove(
    @Param('titleId', ParseIntPipe) titleId: number,
    @Param('qualityName', new ParseEnumPipe(QualityName)) name: QualityName,
  ) {
    return this.qualityService.remove(titleId, name);
  }
}
