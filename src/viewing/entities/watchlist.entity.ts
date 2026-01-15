import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Watchlist } from '@prisma/client';

export class WatchlistEntity implements Watchlist {
  constructor(partial: Partial<WatchlistEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  titleId: number;

  @ApiProperty()
  addedAt: Date;

  @ApiPropertyOptional()
  removedAt: Date | null;
}
