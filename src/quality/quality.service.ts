import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQualityDto } from './dto/create-quality.dto';
import { UpdateQualityDto } from './dto/update-quality.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TitleService } from 'src/title/title.service';
import { QualityName } from '@prisma/client';

@Injectable()
export class QualityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly titleService: TitleService,
  ) {}

  async create(titleId: number, createQualityDto: CreateQualityDto) {
    const title = await this.titleService.findOne(titleId);

    const exists = await this.prisma.quality.findFirst({
      where: { titleId: title.id, name: createQualityDto.name },
    });
    if (exists) {
      throw new BadRequestException(
        `Title ${titleId} already has quality ${createQualityDto.name}`,
      );
    }

    return await this.prisma.quality.create({
      data: { titleId: title.id, name: createQualityDto.name },
    });
  }

  async findAll(titleId: number) {
    const title = await this.titleService.findOne(titleId);

    return this.prisma.quality.findMany({ where: { titleId: title.id } });
  }

  async findOne(titleId: number, name: QualityName) {
    const title = await this.titleService.findOne(titleId);

    const quality = await this.prisma.quality.findFirst({
      where: { titleId: title.id, name },
    });
    if (!quality) {
      throw new NotFoundException(`Quality for Title ${titleId} not found`);
    }

    return quality;
  }

  async update(
    titleId: number,
    name: QualityName,
    updateQualityDto: UpdateQualityDto,
  ) {
    const title = await this.titleService.findOne(titleId);
    const quality = await this.findOne(title.id, name);

    if (updateQualityDto.name && updateQualityDto.name !== name) {
      const exists = await this.prisma.quality.findFirst({
        where: { titleId: title.id, name: updateQualityDto.name },
      });
      if (exists) {
        throw new BadRequestException(
          `Title ${titleId} already has quality ${updateQualityDto.name}`,
        );
      }
    }

    return await this.prisma.quality.update({
      where: { titleId_name: { titleId: title.id, name: quality.name } },
      data: updateQualityDto,
    });
  }

  async remove(titleId: number, name: QualityName) {
    this.titleService.findOne(titleId);
    this.findOne(titleId, name);

    return await this.prisma.quality.delete({
      where: { titleId_name: { titleId: titleId, name: name } },
    });
  }
}
