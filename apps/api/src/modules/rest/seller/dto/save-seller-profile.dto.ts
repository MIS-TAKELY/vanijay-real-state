import { SellerAccountType, SellerSubType } from '@repo/db';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Draft save for the seller registration wizard. Every field is optional so
 * the client can persist partial progress ("save and resume"), but the
 * account type + sub type are required because the wizard always resolves
 * those in the first step before any draft is written.
 */
export class SaveSellerProfileDto {
  @IsEnum(SellerAccountType)
  accountType!: SellerAccountType;

  @IsEnum(SellerSubType)
  subType!: SellerSubType;

  // ── Individual ──────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsBoolean()
  ownershipDeclared?: boolean;

  // ── Agent / Organization ────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(160)
  businessName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  representativeName?: string;

  @IsOptional()
  @IsBoolean()
  hasBusinessRegistration?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  registrationNumber?: string;

  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  businessPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  officeDistrict?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  officeAddress?: string;

  @IsOptional()
  @IsObject()
  officeLocation?: Record<string, unknown>;
}