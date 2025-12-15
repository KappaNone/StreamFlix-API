import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Min } from 'class-validator';

// Payload for checking an invitation before applying it.
export class RedeemInvitationDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ description: 'User attempting to redeem the invitation' })
  @IsInt()
  @Min(1)
  userId: number;
}
