import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TitleService } from './title.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TitleEntity } from './entities/title.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('title')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
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
  update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateTitleDto: UpdateTitleDto,
  ) {
    return this.titleService.update(+id, updateTitleDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TitleEntity })
  remove(@Param('id', ParseIntPipe) id: string) {
    return this.titleService.remove(+id);
  }
}
