import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Headers,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import { auth } from '@repo/auth';
import { fromNodeHeaders } from 'better-auth/node';

@Controller('api/v1/analytics')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  /**
   * Get seller contact info for a live property (public)
   * GET /api/v1/analytics/properties/:id/seller-contact
   */
  @Get('properties/:id/seller-contact')
  async getSellerContact(@Param('id') propertyId: string) {
    return this.analytics.getSellerContact(propertyId);
  }

  /**
   * Track a property view (public)
   * POST /api/v1/analytics/properties/:id/view
   */
  @Post('properties/:id/view')
  async trackView(
    @Param('id') propertyId: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('referer') referrer?: string,
    @Req() req?: any,
  ) {
    const exists = await this.analytics.isLiveProperty(propertyId);
    if (!exists) return { tracked: false };

    let userId: string | undefined;
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      userId = session?.user?.id;
    } catch {}

    await this.analytics.trackView(propertyId, {
      userId,
      userAgent,
      referrer,
    });
    return { tracked: true };
  }

  /**
   * Track a property share (public)
   * POST /api/v1/analytics/properties/:id/share
   */
  @Post('properties/:id/share')
  async trackShare(
    @Param('id') propertyId: string,
    @Body() body: { platform: string },
  ) {
    const exists = await this.analytics.isLiveProperty(propertyId);
    if (!exists) return { tracked: false };

    await this.analytics.trackShare(propertyId, { platform: body.platform });
    return { tracked: true };
  }

  /**
   * Track a click on the seller's phone number (public)
   * POST /api/v1/analytics/properties/:id/phone-click
   */
  @Post('properties/:id/phone-click')
  async trackPhoneClick(
    @Param('id') propertyId: string,
    @Headers('user-agent') userAgent?: string,
    @Headers('referer') referrer?: string,
  ) {
    const exists = await this.analytics.isLiveProperty(propertyId);
    if (!exists) return { tracked: false };

    await this.analytics.trackPhoneClick(propertyId, { userAgent, referrer });
    return { tracked: true };
  }

  /**
   * Get trending properties (public)
   * GET /api/v1/analytics/trending
   */
  @Get('trending')
  async getTrending(
    @Query('limit') limit?: string,
    @Query('period') period?: string,
  ) {
    return this.analytics.getTrendingProperties(
      limit ? Number(limit) : 10,
      (period as any) || '7d',
    );
  }

  /**
   * Get detailed analytics for a property (owner/admin only)
   * GET /api/v1/analytics/properties/:id
   */
  @Get('properties/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('SELLER', 'AGENCY_AGENT', 'AGENCY_ADMIN', 'ADMIN')
  async getPropertyAnalytics(
    @Param('id') propertyId: string,
    @CurrentUser() user: { id: string; role: string[] },
  ) {
    const isAdmin = Array.isArray(user.role) && user.role.includes('ADMIN');
    const isOwner = await this.analytics.isPropertyOwner(propertyId, user.id);
    if (!isOwner && !isAdmin) return null;

    return this.analytics.getPropertyAnalytics(propertyId, user.id);
  }
}
