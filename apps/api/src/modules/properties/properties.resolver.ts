import { UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/modules/rest/auth/guards/auth.guard';
import { RolesGuard } from 'src/modules/rest/auth/guards/role/role.guard';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
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

  @Query(() => [Property], { name: 'properties' })
  @Roles('BUYER', 'SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'SURVEYOR_AGENT', 'ADMIN')
  findAll(
    @Args('take', { type: () => Int, nullable: true, defaultValue: 20 }) take?: number,
    @Args('skip', { type: () => Int, nullable: true, defaultValue: 0 }) skip?: number,
  ) {
    return this.properties.findAll({ take, skip });
  }

  @Query(() => Property, { name: 'property' })
  @Roles('BUYER', 'SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'SURVEYOR_AGENT', 'ADMIN')
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
