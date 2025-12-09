import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, isNumber, IsString } from "class-validator";
import { Title, TitleType } from "@prisma/client";

export class CreateTitleDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsEnum(TitleType)
  @IsNotEmpty()
  @ApiProperty()
  type: TitleType;

  @IsString()
  @ApiProperty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  releaseYear: number;
}
