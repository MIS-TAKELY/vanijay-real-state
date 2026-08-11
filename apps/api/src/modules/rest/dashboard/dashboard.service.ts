import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/db';

export interface DashboardStats {
  activeListings: number;
  totalViews: number;
  openInquiries: number;
  upcomingAppointments: number;
}

export interface DashboardListingSnapshot {
  id: string;
  listingCode: string;
  title: string;
  status: string;
  views: number;
  updatedAt: string;
}

export interface DashboardActivityItem {
  id: string;
  type: 'inquiry' | 'view' | 'appointment' | 'verification';
  message: string;
  timestamp: string;
  relative: string;
}

export interface DashboardAppointment {
  id: string;
  propertyCode: string;
  propertyArea: string;
  type: string;
  status: string;
  day: string;
  month: string;
  officer: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  listings: DashboardListingSnapshot[];
  activity: DashboardActivityItem[];
  appointments: DashboardAppointment[];
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaClient) {}

  async getOverview(userId: string): Promise<DashboardOverview> {
    const [
      activeListings,
      totalViews,
      openInquiries,
      upcomingAppointmentsCount,
      listings,
      inquiries,
      views,
      appointments,
      auditLogs,
    ] = await Promise.all([
      this.prisma.property.count({
        where: { ownerId: userId, status: { in: ['LIVE', 'DRAFT'] } },
      }),
      this.prisma.propertyAnalytics.aggregate({
        _sum: { viewCount: true },
        where: { property: { ownerId: userId } },
      }),
      this.prisma.inquiry.count({
        where: { property: { ownerId: userId }, status: 'OPEN' },
      }),
      this.prisma.officerAppointment.count({
        where: {
          requestedById: userId,
          status: { in: ['REQUESTED', 'SCHEDULED'] },
        },
      }),
      this.prisma.property.findMany({
        where: { ownerId: userId },
        include: {
          analytics: { select: { viewCount: true } },
          media: { where: { isCover: true }, take: 1, select: { url: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 3,
      }),
      this.prisma.inquiry.findMany({
        where: { property: { ownerId: userId } },
        include: { property: { select: { listingCode: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.propertyViewEvent.findMany({
        where: { userId },
        include: { property: { select: { listingCode: true, title: true } } },
        orderBy: { viewedAt: 'desc' },
        take: 5,
      }),
      this.prisma.officerAppointment.findMany({
        where: {
          requestedById: userId,
          status: { in: ['REQUESTED', 'SCHEDULED'] },
        },
        include: {
          property: {
            select: {
              listingCode: true,
              location: { select: { areaName: true, district: true } },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: 3,
      }),
      this.prisma.verificationAuditLog.findMany({
        where: { verifierId: userId },
        include: { property: { select: { listingCode: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const listingSnapshots: DashboardListingSnapshot[] = listings.map((p) => ({
      id: p.id,
      listingCode: p.listingCode,
      title: p.title,
      status: p.status,
      views: p.analytics?.viewCount ?? 0,
      updatedAt: p.updatedAt.toISOString(),
    }));

    const activity: DashboardActivityItem[] = [];

    for (const inquiry of inquiries) {
      activity.push({
        id: inquiry.id,
        type: 'inquiry',
        message: `New inquiry on ${inquiry.property?.listingCode ?? 'a listing'}: ${inquiry.inquirerName ?? 'Anonymous'}`,
        timestamp: inquiry.createdAt.toISOString(),
        relative: this.relativeTime(inquiry.createdAt),
      });
    }

    for (const view of views) {
      activity.push({
        id: view.id,
        type: 'view',
        message: `View on ${view.property?.listingCode ?? 'a listing'}`,
        timestamp: view.viewedAt.toISOString(),
        relative: this.relativeTime(view.viewedAt),
      });
    }

    for (const appt of appointments) {
      activity.push({
        id: appt.id,
        type: 'appointment',
        message: `Appointment ${appt.status.toLowerCase()} for ${appt.property?.listingCode ?? 'a listing'}`,
        timestamp: appt.createdAt.toISOString(),
        relative: this.relativeTime(appt.createdAt),
      });
    }

    for (const log of auditLogs) {
      activity.push({
        id: log.id,
        type: 'verification',
        message: `Verification updated on ${log.property?.listingCode ?? 'a listing'}: ${log.previousLevel} → ${log.newLevel}`,
        timestamp: log.createdAt.toISOString(),
        relative: this.relativeTime(log.createdAt),
      });
    }

    activity.sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1));
    const uniqueActivity = activity.slice(0, 20);

    const upcomingAppointments: DashboardAppointment[] = appointments.map(
      (a) => {
        const scheduled = a.scheduledFor
          ? new Date(a.scheduledFor)
          : new Date(a.createdAt);
        const loc = a.property?.location;
        const area = loc
          ? [loc.areaName, loc.district].filter(Boolean).join(', ')
          : 'Location TBD';
        return {
          id: a.id,
          propertyCode: a.property?.listingCode ?? '—',
          propertyArea: area,
          type: 'Field Verification',
          status: a.status,
          day: String(scheduled.getDate()),
          month: scheduled
            .toLocaleString('en-US', { month: 'short' })
            .toUpperCase(),
          officer: a.officerName ?? 'Unassigned',
        };
      },
    );

    return {
      stats: {
        activeListings,
        totalViews: Number(totalViews._sum.viewCount ?? 0),
        openInquiries,
        upcomingAppointments: upcomingAppointmentsCount,
      },
      listings: listingSnapshots,
      activity: uniqueActivity,
      appointments: upcomingAppointments,
    };
  }

  private relativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
}
