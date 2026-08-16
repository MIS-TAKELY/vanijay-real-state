import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { AdminService } from './admin.service';

@Controller('api/v1/admin')
@UseGuards(AuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  overview() { return this.admin.overview(); }

  @Get('analytics/trend')
  analytics(@Query('days') days?: string) { return this.admin.analyticsTrend(days ? Number(days) : 30); }

  @Get('analytics/overview')
  analyticsOverview() { return this.admin.analyticsOverview(); }

  @Get('analytics/funnel')
  analyticsFunnel(@Query('days') days?: string) { return this.admin.analyticsFunnel(days ? Number(days) : 30); }

  @Get('analytics/activity')
  analyticsActivity(@Query('days') days?: string) { return this.admin.analyticsActivity(days ? Number(days) : 30); }

  @Get('analytics/listings')
  analyticsListings(@Query('days') days?: string) { return this.admin.analyticsListingPerformance(days ? Number(days) : 30); }

  @Get('analytics/market')
  analyticsMarket(@Query('days') days?: string) { return this.admin.analyticsMarket(days ? Number(days) : 365); }

  @Get('analytics/searches')
  analyticsSearches(@Query('days') days?: string) { return this.admin.analyticsSearchInsights(days ? Number(days) : 30); }

  @Get('analytics/leads')
  analyticsLeads(@Query('days') days?: string) { return this.admin.analyticsLeads(days ? Number(days) : 30); }

  @Get('analytics/geography')
  analyticsGeography(@Query('days') days?: string) { return this.admin.analyticsGeography(days ? Number(days) : 30); }

  @Get('analytics/platform')
  analyticsPlatform(@Query('days') days?: string) { return this.admin.analyticsPlatform(days ? Number(days) : 30); }

  @Get('users')
  users(@Query('q') q?: string) { return this.admin.listUsers(q); }

  @Patch('users/:id/roles')
  setRoles(@Param('id') id: string, @Body() body: { roles: string[] }, @CurrentUser('id') actorId: string) {
    return this.admin.setUserRole(actorId, id, body.roles);
  }

  @Get('audit-log')
  auditLog(@Query('take') take?: string) { return this.admin.auditLog(take ? Number(take) : 100); }

  @Get('properties')
  properties(@Query('search') search?: string, @Query('status') status?: string, @Query('type') type?: string, @Query('take') take?: string, @Query('skip') skip?: string) {
    return this.admin.listPropertiesAdmin({ search, status, type, take: take ? Number(take) : 50, skip: skip ? Number(skip) : 0 });
  }

  @Get('properties/:id')
  property(@Param('id') id: string) {
    return this.admin.getPropertyAdmin(id);
  }

  @Patch('properties/:id')
  updateProperty(@Param('id') id: string, @Body() body: any, @CurrentUser('id') actorId: string) {
    return this.admin.updatePropertyAdmin(actorId, id, body);
  }

  @Patch('properties/:id/moderate')
  moderate(@Param('id') id: string, @Body() body: any, @CurrentUser('id') actorId: string) {
    return this.admin.moderateProperty(actorId, id, body);
  }

  @Get('documents')
  documents() { return this.admin.listDocuments(); }

  @Get('verification-queue')
  verificationQueue() { return this.admin.listVerificationQueue(); }
}
