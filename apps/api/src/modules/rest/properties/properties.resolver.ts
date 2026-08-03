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

/**
 * GraphQL transport adapter for properties. Same shared `PropertiesService` as
 * the REST controller — same guards, same RBAC, same business logic.
 */
@Resolver(() => Property)
@UseGuards(AuthGuard, RolesGuard)
export class PropertiesResolver {
  constructor(private readonly properties: PropertiesService) {}

  /**
   * Cursor-paginated feed (newest first). Returns `{ items, nextCursor,
   * hasMore }`. Pass the previous response's `nextCursor` back as `after` to
   * load the next page. Opaque cursor — clients must not parse it.
   */
  @Query(() => PropertyPage, { name: 'propertiesFeed' })
  @Roles(
    'BUYER',
    'SELLER',
    'AGENCY_AGENT',
    'AGENCY_ADMIN',
    'SURVEYOR_AGENT',
    'ADMIN',
  )
  findFeed(
    @Args('first', { type: () => Int, nullable: true, defaultValue: 20 })
    first?: number,
    @Args('after', { type: () => String, nullable: true }) after?: string,
  ) {
    return this.properties.findFeed({ first, after });
  }

  @Query(() => Property, { name: 'property' })
  @Roles(
    'BUYER',
    'SELLER',
    'AGENCY_AGENT',
    'AGENCY_ADMIN',
    'SURVEYOR_AGENT',
    'ADMIN',
  )
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.properties.findOne(id);
  }

  @Mutation(() => Property)
  @Roles('SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'ADMIN')
  createProperty(
    @Args('createPropertyInput') input: CreatePropertyInput,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.properties.create(input, ownerId);
  }

  @Mutation(() => Property)
  @Roles('SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'ADMIN')
  updateProperty(@Args('updatePropertyInput') input: UpdatePropertyInput) {
    return this.properties.update(input);
  }

  @Mutation(() => Property)
  @Roles('AGENCY_ADMIN', 'ADMIN')
  removeProperty(@Args('id', { type: () => ID }) id: string) {
    return this.properties.remove(id);
  }
}
