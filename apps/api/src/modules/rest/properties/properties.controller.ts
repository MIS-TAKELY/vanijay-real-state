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
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { CreatePropertyInput } from './dto/create-property.input';
import { UpdatePropertyInput } from './dto/update-property.input';
import { PropertiesService } from './properties.service';

@Controller('api/v1/properties')
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}

  @Get('feed')
  findFeed(@Query('first') first?: string, @Query('after') after?: string) {
    return this.properties.findFeed({
      first: first ? Number(first) : undefined,
      after,
    });
  }

  // NOTE: must be registered before @Get(':id') so Express doesn't treat
  // "sitemap" as a property id.
  @Get('sitemap')
  findSitemapSlugs() {
    return this.properties.findSitemapSlugs();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.properties.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SELLER', 'ADMIN')
  create(
    @Body() input: CreatePropertyInput,
    @CurrentUser('id') ownerId: string,
  ) {
    return this.properties.create(input, ownerId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SELLER', 'ADMIN')
  update(
    @Param('id') id: string,
    @Body() input: Omit<UpdatePropertyInput, 'id'>,
  ) {
    return this.properties.update({ id, ...input });
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('AGENCY_ADMIN', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.properties.remove(id);
  }
}
