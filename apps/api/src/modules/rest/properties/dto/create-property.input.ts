import { InputType, Field } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  MaxLength,
  ValidateNested,
  IsDefined,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  FacingDirection,
  PropertyType,
  RoadType,
} from '@repo/db';

@InputType()
class LandAreaDetailsInput {
  @Field(() => Number)
  @IsNumber()
  ropani!: number;

  @Field(() => Number)
  @IsNumber()
  aana!: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  paisa?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  daam?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  bigha?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  katha?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  dhur?: number;

  @Field(() => Number)
  @IsNumber()
  totalSqFt!: number;

  @Field(() => Number)
  @IsNumber()
  totalSqMeters!: number;
}

@InputType()
class PropertyLocationInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  province!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  district!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  municipality!: string;

  @Field(() => Number)
  @IsNumber()
  wardNumber!: number;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  areaName!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  addressText?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}

@InputType()
class CadastralRecordInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  kittaNumbers!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  sheetNumber?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  parcelBoundary?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  cadastralMapUrl?: string;
}

@InputType()
export class CreatePropertyInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @Field(() => PropertyType)
  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @Field(() => Number)
  @IsNumber()
  askingPrice!: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  pricePerAana?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  roadAccessWidthFt?: number;

  @Field(() => RoadType, { nullable: true })
  @IsEnum(RoadType)
  @IsOptional()
  roadType?: RoadType;

  @Field(() => FacingDirection, { nullable: true })
  @IsEnum(FacingDirection)
  @IsOptional()
  facing?: FacingDirection;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isCornerPlot?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  agentId?: string;

  @Field(() => LandAreaDetailsInput)
  @ValidateNested()
  @Type(() => LandAreaDetailsInput)
  @IsDefined()
  landArea!: LandAreaDetailsInput;

  @Field(() => PropertyLocationInput)
  @ValidateNested()
  @Type(() => PropertyLocationInput)
  @IsDefined()
  location!: PropertyLocationInput;

  @Field(() => CadastralRecordInput, { nullable: true })
  @ValidateNested()
  @Type(() => CadastralRecordInput)
  @IsOptional()
  cadastralRecord?: CadastralRecordInput;
}
