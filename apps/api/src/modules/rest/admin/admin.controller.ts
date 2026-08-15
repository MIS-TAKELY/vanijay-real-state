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

  @Patch('properties/:id/moderate')
  moderate(@Param('id') id: string, @Body() body: any, @CurrentUser('id') actorId: string) {
    return this.admin.moderateProperty(actorId, id, body);
  }

  @Get('documents')
  documents() { return this.admin.listDocuments(); }

  @Get('verification-queue')
  verificationQueue() { return this.admin.listVerificationQueue(); }
}
