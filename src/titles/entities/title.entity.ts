import { ApiProperty } from "@nestjs/swagger";
import { Title, TitleType } from "@prisma/client";


export class TitleEntity implements Title {
  cons

  constructor(partial: Partial<TitleEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: TitleType;

  @ApiProperty()
  description: string;

  @ApiProperty()
  releaseYear: number;
}
