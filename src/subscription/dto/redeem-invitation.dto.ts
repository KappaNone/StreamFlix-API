import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

export class RedeemInvitationDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'User attempting to redeem the invitation' })
  @IsInt()
  @Min(1)
  userId: number;
}
