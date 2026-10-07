import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  normalizeOptionalEmail,
  trimOptional,
  trimRequired,
} from '../../validation/normalizers';

export class CreateFeedbackDto {
  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome?: string | null;

  @Transform(normalizeOptionalEmail)
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @IsIn(['Elogio', 'Sugestão', 'Crítica', 'Outro'])
  tipo: 'Elogio' | 'Sugestão' | 'Crítica' | 'Outro';

  @IsInt()
  @Min(1)
  @Max(5)
  nota: number;

  @Transform(trimRequired)
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  mensagem: string;
}
