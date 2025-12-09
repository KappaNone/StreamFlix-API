import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TitlesService } from './titles.service';
import { CreateTitleDto } from './dto/create-title.dto';
import { UpdateTitleDto } from './dto/update-title.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TitleEntity } from './entities/title.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('titles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('titles')
export class TitlesController {
  constructor(private readonly titlesService: TitlesService) {}

  @Post()
  @ApiCreatedResponse({ type: TitleEntity })
  async create(@Body() createTitleDto: CreateTitleDto) {
    return new TitleEntity(await this.titlesService.create(createTitleDto));
  }                       

  @Get()
  @ApiOkResponse({ type: TitleEntity, isArray: true })
  findAll() {
    return this.titlesService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: TitleEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.titlesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: TitleEntity })
  update(@Param('id') id: string, @Body() updateTitleDto: UpdateTitleDto) {
    return this.titlesService.update(+id, updateTitleDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: TitleEntity })
  remove(@Param('id') id: string) {
    return this.titlesService.remove(+id);
  }
}
