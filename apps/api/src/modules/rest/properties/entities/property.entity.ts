import {
  Field,
  Float,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  FacingDirection,
  MainCategory,
  MediaType,
  PropertyStatus,
  RoadType,
  SubCategory,
  VerificationStatus,
} from '@repo/db';

@ObjectType()
export class PropertyLocation {
  @Field(() => String)
  province!: string;

  @Field(() => String)
  district!: string;

  @Field(() => String)
  municipality!: string;

  @Field(() => Int)
  wardNumber!: number;

  @Field(() => String)
  areaName!: string;

  @Field(() => String, { nullable: true })
  addressText?: string | null;

  @Field(() => Float, { nullable: true })
  latitude?: number | null;

  @Field(() => Float, { nullable: true })
  longitude?: number | null;
}

@ObjectType()
export class LandAreaDetails {
  @Field(() => Int)
  ropani!: number;

  @Field(() => Int)
  aana!: number;

  @Field(() => Float)
  paisa!: number;

  @Field(() => Float)
  daam!: number;

  @Field(() => Int, { nullable: true })
  bigha?: number | null;

  @Field(() => Int, { nullable: true })
  katha?: number | null;

  @Field(() => Float, { nullable: true })
  dhur?: number | null;

  @Field(() => Float)
  totalSqFt!: number;

  @Field(() => Float)
  totalSqMeters!: number;
}

@ObjectType()
export class PropertyMedia {
  @Field(() => MediaType, { nullable: true })
  type?: MediaType;

  @Field(() => String)
  url!: string;

  @Field(() => String, { nullable: true })
  altText?: string | null;

  @Field(() => Int)
  sortOrder!: number;

  @Field(() => Boolean)
  isCover!: boolean;
}

@ObjectType()
export class Property {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  listingCode!: string;

  @Field(() => String)
  slug!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => MainCategory)
  mainCategory!: MainCategory;

  @Field(() => SubCategory)
  subCategory!: SubCategory;

  @Field(() => PropertyStatus)
  status!: PropertyStatus;

  @Field(() => VerificationStatus)
  verificationLevel!: VerificationStatus;

  @Field(() => Number)
  askingPrice!: number;

  @Field(() => Number, { nullable: true })
  pricePerAana?: number | null;

  @Field(() => Number, { nullable: true })
  roadAccessWidthFt?: number | null;

  @Field(() => RoadType, { nullable: true })
  roadType?: RoadType | null;

  @Field(() => FacingDirection, { nullable: true })
  facing?: FacingDirection | null;

  @Field(() => Boolean)
  isCornerPlot!: boolean;

  @Field(() => Boolean)
  isFeatured!: boolean;

  @Field(() => Boolean)
  isNegotiable!: boolean;

  @Field(() => Float, { nullable: true })
  minBuyableLandSqFt?: number | null;

  @Field(() => String, { nullable: true })
  minBuyableUnitSystem?: string | null;

  @Field(() => Int, { nullable: true })
  minBuyableRopani?: number | null;

  @Field(() => Int, { nullable: true })
  minBuyableAana?: number | null;

  @Field(() => Float, { nullable: true })
  minBuyablePaisa?: number | null;

  @Field(() => Float, { nullable: true })
  minBuyableDaam?: number | null;

  @Field(() => Int, { nullable: true })
  minBuyableBigha?: number | null;

  @Field(() => Int, { nullable: true })
  minBuyableKatha?: number | null;

  @Field(() => Float, { nullable: true })
  minBuyableDhur?: number | null;

  // Type-specific Step 3 specs (see CreatePropertyInput for value domains).
  @Field(() => Float, { nullable: true })
  builtUpAreaSqFt?: number | null;

  @Field(() => String, { nullable: true })
  propertySubtype?: string | null;

  @Field(() => Int, { nullable: true })
  yearBuilt?: number | null;

  @Field(() => String, { nullable: true })
  constructionStatus?: string | null;

  @Field(() => Int, { nullable: true })
  floorNumber?: number | null;

  @Field(() => Int, { nullable: true })
  totalFloors?: number | null;

  @Field(() => Int, { nullable: true })
  bedrooms?: number | null;

  @Field(() => Int, { nullable: true })
  bathrooms?: number | null;

  @Field(() => Int, { nullable: true })
  livingRooms?: number | null;

  @Field(() => Int, { nullable: true })
  kitchens?: number | null;

  @Field(() => Int, { nullable: true })
  balconies?: number | null;

  @Field(() => String, { nullable: true })
  parking?: string | null;

  @Field(() => String, { nullable: true })
  furnishing?: string | null;

  @Field(() => String, { nullable: true })
  houseFacing?: string | null;

  @Field(() => [String], { nullable: true })
  amenities?: string[] | null;

  @Field(() => String, { nullable: true })
  plotShape?: string | null;

  @Field(() => Float, { nullable: true })
  frontageFt?: number | null;

  @Field(() => String, { nullable: true })
  boundaryWall?: string | null;

  @Field(() => Boolean)
  landClearance!: boolean;

  @Field(() => Float, { nullable: true })
  depthFt?: number | null;

  @Field(() => String, { nullable: true })
  zoning?: string | null;

  @Field(() => Boolean)
  setbackAvailable!: boolean;

  @Field(() => String, { nullable: true })
  setbackText?: string | null;

  @Field(() => [String], { nullable: true })
  suitableFor?: string[] | null;

  @Field(() => Int, { nullable: true })
  parkingSpaces?: number | null;

  @Field(() => String, { nullable: true })
  landClassification?: string | null;

  @Field(() => String, { nullable: true })
  soilType?: string | null;

  @Field(() => [String], { nullable: true })
  waterSources?: string[] | null;

  @Field(() => String, { nullable: true })
  irrigationType?: string | null;

  @Field(() => String, { nullable: true })
  currentCrops?: string | null;

  @Field(() => String, { nullable: true })
  fencing?: string | null;

  @Field(() => Boolean)
  electricityAvailable!: boolean;

  @Field(() => String, { nullable: true })
  terrain?: string | null;

  @Field(() => String, { nullable: true })
  annualYield?: string | null;

  @Field(() => [String], { nullable: true })
  farmStructures?: string[] | null;

  @Field(() => Float, { nullable: true })
  ceilingHeightFt?: number | null;

  @Field(() => Boolean)
  parkingAvailable!: boolean;

  @Field(() => String, { nullable: true })
  parkingType?: string | null;

  @Field(() => String, { nullable: true })
  priceType?: string | null;

  @Field(() => Boolean)
  leaseAvailable!: boolean;

  @Field(() => Float, { nullable: true })
  leaseMonthlyRent?: number | null;

  @Field(() => [String], { nullable: true })
  commercialFeatures?: string[] | null;

  @Field(() => String, { nullable: true })
  zoningLegal?: string | null;

  @Field(() => String, { nullable: true })
  heritageType?: string | null;

  @Field(() => String, { nullable: true })
  heritageEra?: string | null;

  @Field(() => String, { nullable: true })
  heritageGrade?: string | null;

  @Field(() => String, { nullable: true })
  courtyard?: string | null;

  @Field(() => [String], { nullable: true })
  traditionalFeatures?: string[] | null;

  @Field(() => String, { nullable: true })
  renovationStatus?: string | null;

  /** Seller-defined specification tables (custom headings + rows). */
  @Field(() => GraphQLJSON, { nullable: true })
  customSpecs?: any;

  @Field(() => String)
  ownerId!: string;

  @Field(() => String, { nullable: true })
  agentId?: string | null;

  @Field(() => PropertyLocation, { nullable: true })
  location?: PropertyLocation | null;

  @Field(() => LandAreaDetails, { nullable: true })
  landArea?: LandAreaDetails | null;

  @Field(() => [PropertyMedia])
  media!: PropertyMedia[];

  @Field(() => GraphQLISODateTime)
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
