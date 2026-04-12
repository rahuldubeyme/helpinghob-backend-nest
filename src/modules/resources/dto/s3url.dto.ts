import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UploadFilesDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'users',
    required: true,
  })
  location: string;

  @IsNotEmpty()
  @ApiProperty({
    enum: ['pdf', 'png', 'jpg', 'jpeg'],
    example: 'png',
    required: true,
  })
  type: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    required: true,
  })
  count: number;
}