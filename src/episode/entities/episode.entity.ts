import { ApiProperty } from '@nestjs/swagger';
import { Episode } from '@prisma/client';
import { IsOptional } from 'class-validator';

export class EpisodeEntity implements Episode {
  constructor(partial: Partial<EpisodeEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  titleId: number;

  @ApiProperty()
  seasonId: number;

  @ApiProperty()
  episodeNumber: number;

  @ApiProperty()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty()
  durationSeconds: number;

  @ApiProperty()
  videoUrl: string;
}
