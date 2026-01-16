import { ApiProperty } from '@nestjs/swagger';

export class ProfilePreference {
  @ApiProperty()
  id: number;

  @ApiProperty()
  profileId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}