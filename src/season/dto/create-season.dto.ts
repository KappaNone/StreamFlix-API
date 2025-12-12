import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateSeasonDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  seasonNumber: number;
}
