import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  Float,
  GraphQLISODateTime,
  ID,
  Int,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import {
  LandAreaDetails,
  PropertyLocation,
  PropertyMedia,
} from '../properties/entities/property.entity';
import { PropertiesService } from '../properties/properties.service';
import { AnalyticsService } from './analytics.service';

@ObjectType()
export class TrendingProperty {
  @Field(() => ID)
  propertyId!: string;

  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  location!: string;

  @Field(() => Float)
  askingPrice!: number;

  @Field(() => Float)
  trendingScore!: number;

  @Field(() => Int)
  viewCount!: number;

  @Field(() => Int)
  favoriteCount!: number;

  @Field(() => Int)
  cartAddCount!: number;
}

@ObjectType()
export class TrendingPropertiesResponse {
  @Field(() => [TrendingProperty])
  items!: TrendingProperty[];
}

@ObjectType()
export class PropertyResponse {
  @Field(() => ID)
  id!: string;

  @Field()
  listingCode!: string;

  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String)
  propertyType!: string;

  @Field(() => String)
  status!: string;

  @Field(() => String)
  verificationLevel!: string;

  @Field(() => Float)
  askingPrice!: number;

  @Field(() => Float, { nullable: true })
  pricePerAana?: number | null;

  @Field(() => Float, { nullable: true })
  roadAccessWidthFt?: number | null;

  @Field(() => String, { nullable: true })
  roadType?: string | null;

  @Field(() => String, { nullable: true })
  facing?: string | null;

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

@ObjectType()
export class PropertyListResponse {
  @Field(() => [PropertyResponse])
  items!: PropertyResponse[];

  @Field(() => Int)
  total!: number;
}

@Resolver(() => TrendingProperty)
export class AnalyticsResolver {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly properties: PropertiesService,
  ) {}

  @Query(() => TrendingPropertiesResponse, { name: 'trendingProperties' })
  async findTrending(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
    @Args('period', { type: () => String, nullable: true, defaultValue: '7d' })
    period: '24h' | '7d' | '30d',
  ) {
    return this.analytics.getTrendingProperties(limit, period);
  }

  @Query(() => PropertyListResponse, { name: 'similarProperties' })
  async findSimilar(
    @Args('propertyId', { type: () => ID }) propertyId: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
  ) {
    return this.analytics.getSimilarProperties(propertyId, limit);
  }

  @Query(() => PropertyListResponse, { name: 'recentlyViewedProperties' })
  @UseGuards(AuthGuard)
  async findRecentlyViewed(
    @CurrentUser('id') userId: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
  ) {
    return this.analytics.getRecentlyViewedProperties(userId, limit);
  }

  @Query(() => PropertyListResponse, { name: 'featuredProperties' })
  async findFeatured(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
  ) {
    return this.analytics.getFeaturedProperties(limit);
  }

  @Query(() => PropertyListResponse, { name: 'recentlyAddedProperties' })
  async findRecentlyAdded(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 })
    limit: number,
  ) {
    return this.analytics.getRecentlyAddedProperties(limit);
  }

  @Query(() => TrendingPropertiesResponse, { name: 'propertyAnalytics' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'ADMIN')
  async getPropertyAnalytics(
    @Args('propertyId', { type: () => ID }) propertyId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.analytics.getPropertyAnalytics(propertyId, userId);
  }
}
