import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateChoiceDto {
  @IsString()
  @MinLength(1)
  label: string;

  @IsUUID()
  toPageId: string;
}
