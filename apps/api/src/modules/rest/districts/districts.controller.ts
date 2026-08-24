import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { DistrictsService, type DistrictMetaDto } from './districts.service';

@Controller()
export class DistrictsController {
  constructor(private readonly districts: DistrictsService) {}

  // Public read — used by client area-guide surfaces.
  @Get('api/v1/districts')
  listPublic() {
    return this.districts.list();
  }

  @Get('api/v1/districts/:slug')
  getOne(@Param('slug') slug: string) {
    return this.districts.getBySlug(slug);
  }

  // Admin
  @Get('api/v1/admin/districts')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  listAdmin() {
    return this.districts.list();
  }

  @Post('api/v1/admin/districts')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsert(
    @Body() dto: DistrictMetaDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.districts.upsert(actorId, dto);
  }

  @Post('api/v1/admin/districts/bulk')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  upsertMany(
    @Body() body: { districts: DistrictMetaDto[] },
    @CurrentUser('id') actorId: string,
  ) {
    return Promise.all(
      (body?.districts ?? []).map((d) => this.districts.upsert(actorId, d)),
    );
  }

  @Delete('api/v1/admin/districts/:slug')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('slug') slug: string, @CurrentUser('id') actorId: string) {
    return this.districts.remove(actorId, slug);
  }
}
