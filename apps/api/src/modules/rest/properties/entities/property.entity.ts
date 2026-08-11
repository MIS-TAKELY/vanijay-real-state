import {
  Field,
  Float,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
} from '@nestjs/graphql';
import {
  FacingDirection,
  MediaType,
  PropertyStatus,
  PropertyType,
  RoadType,
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

  @Field(() => PropertyType)
  propertyType!: PropertyType;

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
