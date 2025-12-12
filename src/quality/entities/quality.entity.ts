import { ApiProperty } from '@nestjs/swagger';
import { Quality, QualityName } from '@prisma/client';

export class QualityEntity implements Quality {
  constructor(partial: Partial<Quality>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  titleId: number;

  @ApiProperty({ enum: QualityName })
  name: QualityName;
}
