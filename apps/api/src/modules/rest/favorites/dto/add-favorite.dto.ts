import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddFavoriteDto {
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @IsOptional()
  @IsBoolean()
  notifyOnPriceChange?: boolean;
}
