import { InputType, Field } from '@nestjs/graphql';
import {
  IsArray,
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
  DocumentType,
  FacingDirection,
  MediaType,
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
class PropertyMediaInput {
  @Field(() => MediaType, { nullable: true })
  @IsEnum(MediaType)
  @IsOptional()
  type?: MediaType;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  url!: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  altText?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isCover?: boolean;
}

@InputType()
class PropertyDocumentInput {
  @Field(() => DocumentType)
  @IsEnum(DocumentType)
  type!: DocumentType;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @Field(() => Number)
  @IsNumber()
  fileSizeMb!: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
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
  // @MaxLength(5000)
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

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isNegotiable?: boolean;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  minBuyableLandSqFt?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  minBuyableUnitSystem?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  minBuyableRopani?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  minBuyableAana?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  minBuyablePaisa?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  minBuyableDaam?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  minBuyableBigha?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  minBuyableKatha?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  minBuyableDhur?: number;

  /* ------------------------------------------------------------------ */
  /* Type-specific Step 3 specs — values are the enum-style strings the   */
  /* wizard sends (see packages/ui listing-wizard constants).            */
  /* ------------------------------------------------------------------ */

  // Building specs (RESIDENTIAL_HOUSE / COMMERCIAL_SPACE / HERITAGE_HOME)
  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  builtUpAreaSqFt?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  propertySubtype?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  yearBuilt?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  constructionStatus?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  floorNumber?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  totalFloors?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  bedrooms?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  bathrooms?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  livingRooms?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  kitchens?: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  balconies?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  parking?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  furnishing?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  houseFacing?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  // Residential land
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  plotShape?: string;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  frontageFt?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  boundaryWall?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  landClearance?: boolean;

  // Commercial land
  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  depthFt?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  zoning?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  setbackAvailable?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  setbackText?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  suitableFor?: string[];

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  parkingSpaces?: number;

  // Agricultural land
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  landClassification?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  soilType?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  waterSources?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  irrigationType?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  currentCrops?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  fencing?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  electricityAvailable?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  terrain?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  annualYield?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  farmStructures?: string[];

  // Commercial space
  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  ceilingHeightFt?: number;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  parkingAvailable?: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  parkingType?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  priceType?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  leaseAvailable?: boolean;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  leaseMonthlyRent?: number;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  commercialFeatures?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  zoningLegal?: string;

  // Heritage home
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  heritageType?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  heritageEra?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  heritageGrade?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  courtyard?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  traditionalFeatures?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  renovationStatus?: string;

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

  /** Gallery & video walkthrough assets uploaded to Cloudinary beforehand. */
  @Field(() => [PropertyMediaInput], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => PropertyMediaInput)
  @IsOptional()
  media?: PropertyMediaInput[];

  /** Verification documents (Lalpurja, citizenship, tax clearance, etc.). */
  @Field(() => [PropertyDocumentInput], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => PropertyDocumentInput)
  @IsOptional()
  documents?: PropertyDocumentInput[];
}
