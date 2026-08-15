import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { GoldService } from './gold.service';
import type { MetalConfigDto, MetalFaqDto, PriceOverrideDto } from './gold.service';

@Controller()
export class GoldController {
  constructor(private readonly gold: GoldService) {}

  // Public
  @Get('api/v1/gold/metals')
  listPublic() { return this.gold.listMetals(false); }

  @Get('api/v1/gold/metals/:slug')
  getMetal(@Param('slug') slug: string) { return this.gold.getMetal(slug); }

  @Get('api/v1/gold/overrides/:metalSlug')
  getOverride(@Param('metalSlug') metalSlug: string) { return this.gold.getActiveOverride(metalSlug); }

  // Admin
  @Get('api/v1/admin/gold/metals')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  listAdmin() { return this.gold.listMetals(true); }

  @Post('api/v1/admin/gold/metals')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsertMetal(@Body() dto: MetalConfigDto, @CurrentUser('id') actorId: string) {
    return this.gold.upsertMetal(actorId, dto);
  }

  @Patch('api/v1/admin/gold/metals/:slug/enabled')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  setEnabled(@Param('slug') slug: string, @Body() body: { isEnabled: boolean }, @CurrentUser('id') actorId: string) {
    return this.gold.setMetalEnabled(actorId, slug, body.isEnabled);
  }

  @Post('api/v1/admin/gold/metals/:slug/faqs')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  setFaqs(@Param('slug') slug: string, @Body() body: { faqs: MetalFaqDto[] }, @CurrentUser('id') actorId: string) {
    return this.gold.setFaqs(actorId, slug, body.faqs);
  }

  @Post('api/v1/admin/gold/overrides')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  setOverride(@Body() dto: PriceOverrideDto, @CurrentUser('id') actorId: string) {
    return this.gold.setOverride(actorId, dto);
  }

  @Post('api/v1/admin/gold/overrides/:id/clear')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  clearOverride(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.gold.clearOverride(actorId, id);
  }
}
