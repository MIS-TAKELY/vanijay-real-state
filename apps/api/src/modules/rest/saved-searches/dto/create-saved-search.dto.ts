import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export const ALERT_FREQUENCIES = ['INSTANT', 'DAILY_DIGEST', 'OFF'] as const;

export class CreateSavedSearchDto {
  /**
   * Human-readable summary, e.g. "Land under 5 Aana, Ward 6, Pokhara".
   * Optional — the service generates one from the filters when omitted.
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  label?: string;

  /** Serialized filter state mirroring the `/search` URL params. */
  @IsObject()
  filters!: Record<string, unknown>;

  @IsOptional()
  @IsIn(ALERT_FREQUENCIES)
  alertFrequency?: (typeof ALERT_FREQUENCIES)[number];
}
