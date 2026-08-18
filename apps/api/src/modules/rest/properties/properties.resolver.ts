import { UseGuards } from '@nestjs/common';
import {
  Args,
  Float,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { PropertyPage } from './entities/property-page.object-type';
import { Property } from './entities/property.entity';
import { SearchSuggestion } from './entities/search-suggestion.entity';
import { PropertiesService } from './properties.service';

@Resolver(() => Property)
export class PropertiesResolver {
  constructor(private readonly properties: PropertiesService) {}

  @Query(() => PropertyPage, { name: 'propertiesFeed' })
  findFeed(
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first?: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Args('q', { type: () => String, nullable: true }) q?: string,
    @Args('type', { type: () => String, nullable: true }) type?: string,
    @Args('price', { type: () => String, nullable: true }) price?: string,
    @Args('district', { type: () => String, nullable: true })
    district?: string,
    @Args('minSize', { type: () => Float, nullable: true })
    minSize?: number,
    @Args('maxSize', { type: () => Float, nullable: true })
    maxSize?: number,
    @Args('municipality', { type: () => String, nullable: true })
    municipality?: string,
    @Args('ward', { type: () => Int, nullable: true })
    ward?: number,
    @Args('facing', { type: () => String, nullable: true })
    facing?: string,
    @Args('roadType', { type: () => String, nullable: true })
    roadType?: string,
    @Args('bedrooms', { type: () => Int, nullable: true })
    bedrooms?: number,
    @Args('bathrooms', { type: () => Int, nullable: true })
    bathrooms?: number,
    @Args('isCornerPlot', { type: () => Boolean, nullable: true })
    isCornerPlot?: boolean,
    @Args('isNegotiable', { type: () => Boolean, nullable: true })
    isNegotiable?: boolean,
    @Args('constructionStatus', { type: () => String, nullable: true })
    constructionStatus?: string,
    @Args('furnishing', { type: () => String, nullable: true })
    furnishing?: string,
    @Args('subCategory', { type: () => String, nullable: true })
    subCategory?: string,
    @Args('amenities', { type: () => [String], nullable: true })
    amenities?: string[],
  ) {
    return this.properties.findFeed({
      first,
      after,
      q,
      type,
      price,
      district,
      minSize,
      maxSize,
      municipality,
      ward,
      facing,
      roadType,
      bedrooms,
      bathrooms,
      isCornerPlot,
      isNegotiable,
      constructionStatus,
      furnishing,
      subCategory,
      amenities,
    });
  }

  @Query(() => [SearchSuggestion], { name: 'searchSuggestions' })
  searchSuggestions(
    @Args('q', { type: () => String }) q: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 8 })
    limit?: number,
  ) {
    return this.properties.suggestLocations(q, limit);
  }

  @Query(() => Property, { name: 'property' })
  findOne(@Args('idOrSlug', { type: () => ID }) idOrSlug: string) {
    return this.properties.findOne(idOrSlug);
  }

  @Query(() => [Property], { name: 'myProperties' })
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'ADMIN')
  myProperties(@CurrentUser('id') ownerId: string) {
    return this.properties.findByOwner(ownerId);
  }

  @Mutation(() => Property)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'ADMIN')
  createProperty(
    @Args('createPropertyInput') input: CreatePropertyInput,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.properties.create(input, ownerId);
  }

  @Mutation(() => Property)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'ADMIN')
  updateProperty(@Args('updatePropertyInput') input: UpdatePropertyInput) {
    return this.properties.update(input);
  }

  @Mutation(() => Property)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('AGENCY_ADMIN', 'ADMIN')
  removeProperty(@Args('id', { type: () => ID }) id: string) {
    return this.properties.remove(id);
  }
}
