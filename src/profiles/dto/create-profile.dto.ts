import { IsString, IsOptional, IsEnum } from 'class-validator';
import { AgeCategory } from '@prisma/client';

export class CreateProfileDto {
  @IsString() name: string;
  @IsEnum(AgeCategory) ageCategory: AgeCategory;
  @IsOptional() @IsString() imageUrl?: string;
}