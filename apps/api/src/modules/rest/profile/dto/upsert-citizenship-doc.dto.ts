import { IsDateString, IsIn, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpsertCitizenshipDocDto {
  @IsIn(['CITIZENSHIP_FRONT', 'CITIZENSHIP_BACK'])
  type!: 'CITIZENSHIP_FRONT' | 'CITIZENSHIP_BACK';

  @IsOptional()
  @IsString()
  @IsUrl()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  citizenshipNo?: string;

  @IsOptional()
  @IsDateString()
  citizenshipIssueDate?: string;
}