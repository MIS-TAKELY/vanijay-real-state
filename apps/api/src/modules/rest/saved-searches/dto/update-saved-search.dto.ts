import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ALERT_FREQUENCIES } from './create-saved-search.dto';

export class UpdateSavedSearchDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  label?: string;

  @IsOptional()
  @IsIn(ALERT_FREQUENCIES)
  alertFrequency?: (typeof ALERT_FREQUENCIES)[number];
}
