import {
  IsArray, IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min,
} from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  authorId: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
