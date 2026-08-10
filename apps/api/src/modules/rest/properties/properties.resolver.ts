import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { PropertyPage } from './entities/property-page.object-type';
import { Property } from './entities/property.entity';
import { PropertiesService } from './properties.service';


@Resolver(() => Property)
export class PropertiesResolver {
  constructor(private readonly properties: PropertiesService) {}

  @Query(() => PropertyPage, { name: 'propertiesFeed' })
  findFeed(
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first?: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
  ) {
    return this.properties.findFeed({ first, after });
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
