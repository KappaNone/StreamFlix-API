import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ViewingProgress } from '@prisma/client';

export class ViewingProgressEntity implements ViewingProgress {
  constructor(partial: Partial<ViewingProgressEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  titleId: number;

  @ApiPropertyOptional()
  episodeId: number | null;

  @ApiProperty()
  positionSeconds: number;

  @ApiProperty()
  totalDurationSeconds: number;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty()
  autoPlayNextEpisode: boolean;

  @ApiProperty()
  lastViewedAt: Date;

  @ApiPropertyOptional()
  completedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
