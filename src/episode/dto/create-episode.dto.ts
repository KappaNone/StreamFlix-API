import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateEpisodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  episodeNumber: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  durationSeconds: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  videoUrl: string;
}
