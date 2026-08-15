import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/db';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaClient) {}

  async overview() {
    const [
      totalProperties, propertiesByStatus, totalUsers, totalSellers, totalDocuments,
      documentsExpiring, totalContentItems, totalKabadiItems, totalInquiries, totalAppointments, totalAuditLogs,
    ] = await Promise.all([
      this.prisma.property.count(),
      this.prisma.property.groupBy({ by: ['status'], _count: { _all: true } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: { has: 'SELLER' } } }),
      this.prisma.propertyDocument.count(),
      this.prisma.propertyDocument.count({ where: { status: { in: ['VERIFIED'] }, expiryDate: { lte: <any>new Date(Date.now() + 30 * 86400000) } } }),
      this.prisma.contentItem.count(),
      this.prisma.kabadiItem.count(),
      this.prisma.inquiry.count(),
      this.prisma.officerAppointment.count({ where: { status: { in: ['REQUESTED', 'SCHEDULED'] } } }),
      this.prisma.adminAuditLog.count(),
    ]);
    return {
      totalProperties,
      propertiesByStatus,
      totalUsers,
      totalSellers,
      totalDocuments,
      documentsExpiring,
      totalContentItems,
      totalKabadiItems,
      totalInquiries,
      totalAppointments,
      totalAuditLogs,
    };
  }

  async analyticsTrend(days = 30) {
    const since = new Date(Date.now() - days * 86400000);
    const [views, favorites, phoneClicks, searches, inquiries, propertyViews] = await Promise.all([
      this.prisma.propertyAnalytics.findMany({ select: { updatedAt: true, viewCount: true, favoritesLast7d: true, phoneClickCount: true } }),
      this.prisma.propertyAnalytics.aggregate({ _sum: { favoriteCount: true } }),
      this.prisma.propertyAnalytics.aggregate({ _sum: { phoneClickCount: true } }),
      this.prisma.propertySearchEvent.count({ where: { searchedAt: { gte: since } } }),
      this.prisma.inquiry.count({ where: { createdAt: { gte: since } } }),
      this.prisma.propertyViewEvent.count({ where: { viewedAt: { gte: since } } }),
    ]);
    return {
      since,
      views,
      totalFavorites: favorites._sum.favoriteCount ?? 0,
      totalPhoneClicks: phoneClicks._sum.phoneClickCount ?? 0,
      searches,
      inquiries,
      propertyViews,
    };
  }

  async listUsers(query?: string) {
    return this.prisma.user.findMany({
      where: query
        ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }] }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { profile: true },
    });
  }

  async setUserRole(actorId: string, userId: string, roles: string[]) {
    await this.prisma.user.update({ where: { id: userId }, data: { role: roles as any } });
    await this.audit(actorId, 'role_change', 'user', userId, `Set roles to ${roles.join(', ')}`);
    return this.prisma.user.findUnique({ where: { id: userId }, include: { profile: true } });
  }

  async auditLog(take = 100) {
    return this.prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      include: { actor: { select: { id: true, name: true, email: true } } },
    });
  }

  async listPropertiesAdmin(params: { search?: string; status?: string; type?: string; take?: number; skip?: number }) {
    const where: Record<string, unknown> = {};
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { listingCode: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.status) where.status = params.status;
    if (params.type) where.propertyType = params.type;
    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: params.take ?? 50,
        skip: params.skip ?? 0,
        include: { location: true, landArea: true, media: true, owner: { select: { id: true, name: true, email: true } }, analytics: true },
      }),
      this.prisma.property.count({ where }),
    ]);
    return { items, total };
  }

  async moderateProperty(actorId: string, id: string, patch: { status?: string; adminNote?: string; isFeatured?: boolean; verificationLevel?: string }) {
    const property = await this.prisma.property.update({
      where: { id },
      data: { status: patch.status as any, adminNote: patch.adminNote, isFeatured: patch.isFeatured, verificationLevel: patch.verificationLevel as any },
    });
    await this.audit(actorId, 'moderate', 'property', id, `Moderated property ${property.listingCode} (${patch.status ?? 'note/feature'})`);
    return property;
  }

  async listDocuments() {
    return this.prisma.propertyDocument.findMany({ orderBy: { uploadedAt: 'desc' }, take: 200 });
  }

  async listVerificationQueue() {
    return this.prisma.property.findMany({
      where: { status: 'UNDER_VERIFICATION' },
      orderBy: { updatedAt: 'asc' },
      include: { media: true, documents: true, owner: { select: { id: true, name: true, email: true } } },
    });
  }

  private async audit(actorId: string, action: string, entity: string, entityId: string | null | undefined, summary: string) {
    if (!actorId) return;
    try {
      await this.prisma.adminAuditLog.create({ data: { actorId, action, entity, entityId: entityId ?? undefined, summary } });
    } catch { /* no-op */ }
  }
}
