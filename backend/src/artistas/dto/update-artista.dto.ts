import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidateIf,
} from 'class-validator';
import { DocumentoCpfCnpjConstraint, normalizeDocumento } from '../documento';
import {
  normalizeEmail,
  normalizePhone,
  trimOptional,
  trimRequired,
  trimStringArray,
} from '../../validation/normalizers';

export class UpdateArtistaDto {
  @Transform(trimRequired)
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  nome?: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nome_artistico?: string | null;

  @Transform(({ value }) => normalizeDocumento(value))
  @IsOptional()
  @IsString()
  @Validate(DocumentoCpfCnpjConstraint)
  cpf_cnpj?: string | null;

  @Transform(normalizeEmail)
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @Transform(normalizePhone)
  @IsOptional()
  @IsString()
  @Matches(/^\d{10,11}$/)
  contato?: string | null;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  cidade?: string | null;

  @Transform(trimRequired)
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  area_atuacao?: string;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string | null;

  @Transform(trimStringArray)
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(60, { each: true })
  tags?: string[];

  @Transform(trimStringArray)
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(60, { each: true })
  disponibilidade?: string[];

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @MaxLength(5_000_000)
  foto_url?: string | null;

  @Transform(trimOptional)
  @IsOptional()
  @IsString()
  @Matches(
    /^(@?[a-z\d._]{1,30}|https?:\/\/(www\.)?instagram\.com\/[a-z\d._]+\/?)$/i,
  )
  instagram?: string | null;

  @Transform(trimOptional)
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(2048)
  site?: string | null;

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsIn(['Pendente', 'Aprovado', 'Rejeitado'])
  status?: 'Pendente' | 'Aprovado' | 'Rejeitado';

  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsBoolean()
  forceStatus?: boolean;
}
