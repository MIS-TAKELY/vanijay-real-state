import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  permanentDistrict?: string;

  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @IsOptional()
  @IsIn(['en', 'ne'])
  preferredLanguage?: 'en' | 'ne';

  @IsOptional()
  @IsIn(['PHONE', 'WHATSAPP', 'VIBER'])
  preferredContactMethod?: 'PHONE' | 'WHATSAPP' | 'VIBER';

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;
}
