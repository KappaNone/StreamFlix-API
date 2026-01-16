import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgeCategory } from '@prisma/client';

export class CreateProfileDto {
  @ApiProperty({ description: 'Profile name', example: 'Kids Profile' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Age category', enum: AgeCategory, example: AgeCategory.ALL })
  @IsEnum(AgeCategory)
  ageCategory: AgeCategory;
}