import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSeasonDto } from './dto/create-season.dto';
import { UpdateSeasonDto } from './dto/update-season.dto';
import { TitleType } from '@prisma/client';

@Injectable()
export class SeasonService {
  constructor(private readonly prisma: PrismaService) {}

  async findSeriesTitleOrThrow(titleId: number) {
    const title = await this.prisma.title.findUnique({ where: { id: titleId } });
    if (!title) throw new NotFoundException(`Title ${titleId} not found`);
    if (title.type !== TitleType.SERIES) {
      throw new BadRequestException(`Title ${titleId} is of type ${title.type} and has no seasons`);
    }
  }

  async create(titleId: number, dto: CreateSeasonDto) {
    await this.findSeriesTitleOrThrow(titleId);

    return this.prisma.season.create({
      data: {
        titleId,
        ...dto,
      },
    });
  }

  async findAllByTitle(titleId: number) {
    await this.findSeriesTitleOrThrow(titleId).then();
    
    return this.prisma.season.findMany({
      where: { titleId },
      orderBy: { seasonNumber: 'asc' },
    });
  }

  async findOneByNumber(titleId: number, seasonNumber: number) {
    await this.findSeriesTitleOrThrow(titleId);

    const season = await this.prisma.season.findFirst({
      where: { titleId, seasonNumber },
    });
    if (!season)
      throw new NotFoundException(`Season ${seasonNumber} for title ${titleId} not found`);
    return season;
  }

  async updateByNumber(titleId: number, seasonNumber: number, dto: UpdateSeasonDto) {
    const season = await this.findOneByNumber(titleId, seasonNumber);
    return this.prisma.season.update({
      where: { id: season.id },
      data: {
        seasonNumber: dto.seasonNumber ?? season.seasonNumber,
      },
    });
  }

  async removeByNumber(titleId: number, seasonNumber: number) {
    const season = await this.findOneByNumber(titleId, seasonNumber);

    await this.prisma.season.delete({ where: { id: season.id } });
    return { deleted: true };
  }
}