import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsBoolean, Min } from 'class-validator';

export class RecordViewingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  titleId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  episodeId?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  positionSeconds: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  totalDurationSeconds: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  isCompleted: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  autoPlayNextEpisode?: boolean;
}
