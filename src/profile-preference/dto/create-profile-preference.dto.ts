import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateProfilePreferenceDto {
  @ApiProperty()
  @IsInt()
  profileId: number;
}