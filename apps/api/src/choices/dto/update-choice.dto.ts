import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateChoiceDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  label?: string;

  @IsOptional()
  @IsUUID()
  toPageId?: string;
}
