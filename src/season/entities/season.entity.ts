import { ApiProperty } from '@nestjs/swagger';
import { Season } from '@prisma/client';

export class SeasonEntity implements Season {
  constructor(partial: Partial<SeasonEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  titleId: number;

  @ApiProperty()
  seasonNumber: number;
}
