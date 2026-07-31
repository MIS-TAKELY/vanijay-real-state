import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/modules/rest/auth/guards/auth.guard';
import { RolesGuard } from 'src/modules/rest/auth/guards/role/role.guard';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { PropertiesService } from './properties.service';

/**
 * REST transport adapter for properties. No business logic here — it parses
 * input, applies auth/RBAC via guards, and delegates to the shared
 * `PropertiesService` (the same one the GraphQL resolver uses).
 */
@Controller('api/v1/properties')
@UseGuards(AuthGuard, RolesGuard)
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}

  @Get()
  @Roles('BUYER', 'SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'SURVEYOR_AGENT', 'ADMIN')
  findAll(@Query('take') take?: number, @Query('skip') skip?: number) {
    return this.properties.findAll({
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    });
  }

  @Get(':id')
  @Roles('BUYER', 'SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'SURVEYOR_AGENT', 'ADMIN')
  findOne(@Param('id') id: string) {
    return this.properties.findOne(id);
  }

  @Post()
  @Roles('SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'ADMIN')
  create(
    @Body() input: CreatePropertyInput,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.properties.create(input, ownerId);
  }

  @Patch(':id')
  @Roles('SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'ADMIN')
  update(@Param('id') id: string, @Body() input: Omit<UpdatePropertyInput, 'id'>) {
    return this.properties.update({ id, ...input });
  }

  @Delete(':id')
  @Roles('AGENCY_ADMIN', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.properties.remove(id);
  }
}
