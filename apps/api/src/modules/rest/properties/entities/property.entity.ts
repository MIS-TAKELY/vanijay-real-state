import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import {
  FacingDirection,
  PropertyStatus,
  PropertyType,
  RoadType,
  VerificationStatus,
} from '@repo/db';

/**
 * GraphQL `@ObjectType` that doubles as the REST response shape.
 *
 * We deliberately map Prisma rows through `PropertiesService.mapToResponse()`
 * (Decimal -> number) so we never leak the raw Prisma row shape to clients and
 * so GraphQL `Float`/enum types serialize correctly.
 *
 * Note: this intentionally does NOT `implements Partial<PrismaProperty>` — the
 * response shape differs from the Prisma row (Decimal -> number), so a strict
 * structural match would fight us. The field names are kept in sync by hand.
 */
@ObjectType()
export class Property {
  @Field(() => ID)
  id: string;

    @Field(() => String)
  listingCode: string;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => PropertyType)
  propertyType: PropertyType;

  @Field(() => PropertyStatus)
  status: PropertyStatus;

  @Field(() => VerificationStatus)
  verificationLevel: VerificationStatus;

  @Field(() => Number)
  askingPrice: number;

  @Field(() => Number, { nullable: true })
  pricePerAana?: number | null;

  @Field(() => Number, { nullable: true })
  roadAccessWidthFt?: number | null;

  @Field(() => RoadType, { nullable: true })
  roadType?: RoadType | null;

  @Field(() => FacingDirection, { nullable: true })
  facing?: FacingDirection | null;

    @Field(() => Boolean)
  isCornerPlot: boolean;

  @Field(() => String)
  ownerId: string;

  @Field(() => String, { nullable: true })
  agentId?: string | null;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
