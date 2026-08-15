import {
  Body, Controller, Delete, Get, Param, ParseEnumPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ContentPlacement, ContentSlot } from '@repo/db';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { CmsService } from './cms.service';
import type { UpsertContentItemDto } from './cms.service';

@Controller()
export class CmsController {
  constructor(private readonly cms: CmsService) {}

  // ---- Public reads (used by the client) ----

  @Get('api/v1/cms/:placement')
  listItems(
    @Param('placement', new ParseEnumPipe(ContentPlacement)) placement: ContentPlacement,
    @Query('slot') slot?: ContentSlot,
  ) {
    return this.cms.listItems(placement, slot, { includeUnpublished: false });
  }

  @Get('api/v1/cms/static-pages')
  listStaticPages() { return this.cms.listStaticPages(); }

  @Get('api/v1/cms/nav')
  listNav() { return this.cms.listNav(); }

  @Get('api/v1/cms/footer')
  listFooter() { return this.cms.listFooter(); }

  @Get('api/v1/cms/seo')
  listSeo() { return this.cms.listSeo(); }

  // ---- Admin writes ----

  @Get('api/v1/admin/cms')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  adminList(
    @Query('placement', new ParseEnumPipe(ContentPlacement)) placement: ContentPlacement,
    @Query('slot') slot?: ContentSlot,
  ) {
    return this.cms.listItems(placement, slot, { includeUnpublished: true });
  }

  @Post('api/v1/admin/cms/:placement/:slot')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsertItem(
    @Param('placement', new ParseEnumPipe(ContentPlacement)) placement: ContentPlacement,
    @Param('slot', new ParseEnumPipe(ContentSlot)) slot: ContentSlot,
    @Body() dto: UpsertContentItemDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.cms.upsertItem(actorId, placement, slot, dto);
  }

  @Patch('api/v1/admin/cms/items/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateItem(
    @Param('id') id: string,
    @Body() patch: Partial<UpsertContentItemDto>,
    @CurrentUser('id') actorId: string,
  ) {
    return this.cms.updateItem(actorId, id, patch);
  }

  @Patch('api/v1/admin/cms/items/:id/publish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  publish(@Param('id') id: string, @Body() body: { published: boolean }, @CurrentUser('id') actorId: string) {
    return this.cms.setPublished(actorId, id, body.published);
  }

  @Post('api/v1/admin/cms/:placement/:slot/reorder')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  reorder(
    @Param('placement', new ParseEnumPipe(ContentPlacement)) placement: ContentPlacement,
    @Param('slot', new ParseEnumPipe(ContentSlot)) slot: ContentSlot,
    @Body() body: { ids: string[] },
    @CurrentUser('id') actorId: string,
  ) {
    return this.cms.reorder(actorId, placement, slot, body.ids);
  }

  @Delete('api/v1/admin/cms/items/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string, @CurrentUser('id') actorId: string) {
    return this.cms.removeItem(actorId, id);
  }

  // ---- Static pages / nav / footer / SEO (admin) ----

  @Post('api/v1/admin/cms/static-pages')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsertStaticPage(@Body() dto: any, @CurrentUser('id') actorId: string) {
    return this.cms.upsertStaticPage(actorId, dto);
  }

  @Post('api/v1/admin/cms/nav')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsertNav(@Body() dto: any, @CurrentUser('id') actorId: string) {
    return this.cms.upsertNav(actorId, dto);
  }

  @Post('api/v1/admin/cms/footer')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsertFooter(@Body() dto: any, @CurrentUser('id') actorId: string) {
    return this.cms.upsertFooter(actorId, dto);
  }

  @Post('api/v1/admin/cms/seo')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsertSeo(@Body() dto: any, @CurrentUser('id') actorId: string) {
    return this.cms.upsertSeo(actorId, dto);
  }
}
