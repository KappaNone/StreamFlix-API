import { ApiProperty } from '@nestjs/swagger';
import { AgeCategory, User } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty()
  @IsString()
  name: string;
    
  @IsEnum(AgeCategory)
  @IsNotEmpty()
  @ApiProperty()
  ageCategory: AgeCategory;

  @ApiProperty()
  @IsNumber()
  userId: number
}
