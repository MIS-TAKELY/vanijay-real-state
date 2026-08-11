import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('overview')
  @UseGuards(AuthGuard)
  async overview(@CurrentUser('id') userId: string) {
    return this.dashboard.getOverview(userId);
  }
}
