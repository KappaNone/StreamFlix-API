import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddToWatchlistDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  titleId: number;
}
