import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { trimRequired, trimOptional } from '../../validation/normalizers';

export class ArtistEventDto {
  @Transform(trimRequired)
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  titulo: string;
  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string | null;
  @IsDateString({ strict: true }) starts_at: string;
  @Transform(trimRequired)
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  local: string;
  @Transform(trimRequired)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  cidade: string;
  @Transform(trimOptional)
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(2048)
  link?: string | null;
  @IsBoolean() is_public: boolean;
}
