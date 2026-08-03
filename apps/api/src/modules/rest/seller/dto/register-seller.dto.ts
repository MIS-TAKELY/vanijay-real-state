import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class RegisterSellerDto {
  @IsBoolean()
  agreedToTerms!: boolean;

  @IsOptional()
  @IsString()
  permanentAddress?: string;
}
