import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { SettingsService } from './settings.service';

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  // Public read (client footer/brand)
  @Get('api/v1/settings')
  get() {
    return this.settings.getConfig();
  }

  @Get('api/v1/admin/settings')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAdmin() {
    return this.settings.getConfig();
  }

  @Put('api/v1/admin/settings')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(
    @Body() body: Record<string, unknown>,
    @CurrentUser('id') actorId: string,
  ) {
    return this.settings.updateConfig(actorId, body);
  }
}
