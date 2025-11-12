import { IsString, IsOptional } from 'class-validator';

export class UpdateGameSessionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
