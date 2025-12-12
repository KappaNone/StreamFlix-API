import { ApiProperty } from '@nestjs/swagger';
import { QualityName } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class CreateQualityDto {
  @IsEnum(QualityName)
  @IsNotEmpty()
  @ApiProperty()
  name: QualityName;
}
