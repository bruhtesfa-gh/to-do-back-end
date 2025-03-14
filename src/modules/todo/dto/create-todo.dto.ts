import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateTodoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  collectionId: number;

  @ApiProperty()
  @IsNumber()
  parentTodoId?: number;

  @ApiProperty()
  @IsDate()
  dueDate?: Date;
}
