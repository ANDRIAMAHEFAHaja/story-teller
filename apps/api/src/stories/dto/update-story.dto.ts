import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateStoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
