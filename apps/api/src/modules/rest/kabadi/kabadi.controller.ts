import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { KabadiService } from './kabadi.service';
import type { CategoryDto, ItemDto, SetRatesDto } from './kabadi.service';

@Controller()
export class KabadiController {
  constructor(private readonly kabadi: KabadiService) {}

  // Public
  @Get('api/v1/kabadi/categories')
  listPublic() { return this.kabadi.listCategories(false); }

  // Admin
  @Get('api/v1/admin/kabadi/categories')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  listAdmin() { return this.kabadi.listCategories(true); }

  @Post('api/v1/admin/kabadi/categories')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsertCategory(@Body() dto: CategoryDto, @CurrentUser('id') actorId: string) {
    return this.kabadi.upsertCategory(actorId, dto);
  }

  @Patch('api/v1/admin/kabadi/categories/:id/publish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  publishCategory(@Param('id') id: string, @Body() body: { published: boolean }, @CurrentUser('id') actorId: string) {
    return this.kabadi.setCategoryPublished(actorId, id, body.published);
  }

  @Post('api/v1/admin/kabadi/items')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsertItem(@Body() dto: ItemDto, @CurrentUser('id') actorId: string) {
    return this.kabadi.upsertItem(actorId, dto);
  }

  @Post('api/v1/admin/kabadi/items/bulk')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  setRates(@Body() dto: SetRatesDto, @CurrentUser('id') actorId: string) {
    return this.kabadi.setRates(actorId, dto);
  }

  @Patch('api/v1/admin/kabadi/items/:id/publish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  publishItem(@Param('id') id: string, @Body() body: { published: boolean }, @CurrentUser('id') actorId: string) {
    return this.kabadi.setItemPublished(actorId, id, body.published);
  }

  @Delete('api/v1/admin/kabadi/items/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  removeItem(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.kabadi.removeItem(actorId, id);
  }
}
