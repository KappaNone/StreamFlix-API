import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Title, TitleType } from '@prisma/client';

export class CreateTitleDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsEnum(TitleType)
  @IsNotEmpty()
  @ApiProperty({ type: String, enum: TitleType })
  type: TitleType;

  @IsString()
  @ApiProperty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  releaseYear: number;
}
