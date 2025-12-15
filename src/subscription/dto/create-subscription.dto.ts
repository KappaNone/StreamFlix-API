import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({ description: 'Subscription plan code such as basic_sd' })
  @IsString()
  planCode: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  invitationCode?: string;
}
