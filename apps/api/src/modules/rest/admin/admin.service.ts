import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@repo/db';

/**
 * Content-edit payload for a property (admin). Mirrors the seller-facing
 * UpdatePropertyInput — scalars plus nested location / landArea / media.
 */
export interface UpdatePropertyAdminInput {
  title?: string;
  description?: string;
  propertyType?: string;
  status?: string;
  askingPrice?: number;
  pricePerAana?: number;
  roadAccessWidthFt?: number;
  roadType?: string;
  facing?: string;
  isCornerPlot?: boolean;
  isFeatured?: boolean;
  adminNote?: string;
  location?: {
    province?: string;
    district?: string;
    municipality?: string;
    wardNumber?: number;
    areaName?: string;
    addressText?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  landArea?: {
    ropani?: number;
    aana?: number;
    paisa?: number;
    daam?: number;
    bigha?: number | null;
    katha?: number | null;
    dhur?: number | null;
    totalSqFt?: number;
    totalSqMeters?: number;
  };
  media?: { url: string; altText?: string | null; type?: string; sortOrder?: number; isCover?: boolean }[];
  /** Ignored on admin edits — verification documents stay seller-managed. */
  documents?: unknown;
}

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
    const [properties, users, inquiries] = await Promise.all([
      this.prisma.property.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      this.prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
      this.prisma.inquiry.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    ]);

    const key = (d: Date) => d.toISOString().slice(0, 10);
    const buckets = new Map<string, { date: string; listings: number; users: number; inquiries: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      buckets.set(key(date), { date: key(date), listings: 0, users: 0, inquiries: 0 });
    }
    for (const p of properties) { const b = buckets.get(key(p.createdAt)); if (b) b.listings++; }
    for (const u of users) { const b = buckets.get(key(u.createdAt)); if (b) b.users++; }
    for (const i of inquiries) { const b = buckets.get(key(i.createdAt)); if (b) b.inquiries++; }

    return Array.from(buckets.values());
  }

  // ============================================================
  // ANALYTICS — full suite (KPIs, funnel, activity, market, etc.)
  // All event tables already written by the client (views, searches,
  // phone clicks, shares, favorites, cart adds, inquiries) are surfaced
  // here so the admin console reports real user behaviour.
  // ============================================================

  private async dailyBuckets(days: number, fields: string[]): Promise<Map<string, { date: string } & Record<string, number>>> {
    const key = (d: Date) => d.toISOString().slice(0, 10);
    const buckets = new Map<string, { date: string } & Record<string, number>>();
    for (let i = days - 1; i >= 0; i--) {
      const k = key(new Date(Date.now() - i * 86400000));
      const row = { date: k } as { date: string } & Record<string, number>;
      for (const f of fields) row[f] = 0;
      buckets.set(k, row);
    }
    return buckets;
  }

  private pctDelta(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  /** KPI cards: current 30d totals + % change vs the previous 30d. */
  async analyticsOverview() {
    const days = 30;
    const now = Date.now();
    const cur = { gte: new Date(now - days * 86400000) };
    const prev = { gte: new Date(now - 2 * days * 86400000), lt: new Date(now - days * 86400000) };

    const [
      viewsCur, viewsPrev, uniqueCur, uniquePrev,
      searchesCur, searchesPrev,
      inquiriesCur, inquiriesPrev,
      phoneCur, phonePrev,
      favCur, favPrev,
      cartCur, cartPrev,
      sharesCur, sharesPrev,
      listingsCur, listingsPrev,
      usersCur, usersPrev,
    ] = await Promise.all([
      this.prisma.propertyViewEvent.count({ where: { viewedAt: cur } }),
      this.prisma.propertyViewEvent.count({ where: { viewedAt: prev } }),
      this.prisma.propertyViewEvent.findMany({ where: { viewedAt: cur }, select: { userId: true, ipHash: true } }),
      this.prisma.propertyViewEvent.findMany({ where: { viewedAt: prev }, select: { userId: true, ipHash: true } }),
      this.prisma.propertySearchEvent.count({ where: { searchedAt: cur } }),
      this.prisma.propertySearchEvent.count({ where: { searchedAt: prev } }),
      this.prisma.inquiry.count({ where: { createdAt: cur } }),
      this.prisma.inquiry.count({ where: { createdAt: prev } }),
      this.prisma.propertyPhoneClickEvent.count({ where: { clickedAt: cur } }),
      this.prisma.propertyPhoneClickEvent.count({ where: { clickedAt: prev } }),
      this.prisma.favorite.count({ where: { createdAt: cur } }),
      this.prisma.favorite.count({ where: { createdAt: prev } }),
      this.prisma.cartItem.count({ where: { createdAt: cur } }),
      this.prisma.cartItem.count({ where: { createdAt: prev } }),
      this.prisma.propertyShareEvent.count({ where: { sharedAt: cur } }),
      this.prisma.propertyShareEvent.count({ where: { sharedAt: prev } }),
      this.prisma.property.count({ where: { createdAt: cur } }),
      this.prisma.property.count({ where: { createdAt: prev } }),
      this.prisma.user.count({ where: { createdAt: cur } }),
      this.prisma.user.count({ where: { createdAt: prev } }),
    ]);

    const unique = (rows: { userId: string | null; ipHash: string | null }[]) => {
      const seen = new Set<string>();
      for (const v of rows) {
        if (v.userId) seen.add(`u:${v.userId}`);
        else if (v.ipHash) seen.add(`i:${v.ipHash}`);
      }
      return seen.size;
    };

    const kpi = (value: number, previous: number) => ({ value, delta: this.pctDelta(value, previous) });
    return {
      views: kpi(viewsCur, viewsPrev),
      uniqueViewers: kpi(unique(uniqueCur), unique(uniquePrev)),
      searches: kpi(searchesCur, searchesPrev),
      inquiries: kpi(inquiriesCur, inquiriesPrev),
      phoneClicks: kpi(phoneCur, phonePrev),
      favorites: kpi(favCur, favPrev),
      cartAdds: kpi(cartCur, cartPrev),
      shares: kpi(sharesCur, sharesPrev),
      newListings: kpi(listingsCur, listingsPrev),
      newUsers: kpi(usersCur, usersPrev),
    };
  }

  /** Buyer engagement funnel: Views → Favorites → Cart → Inquiries → Phone clicks. */
  async analyticsFunnel(days = 30) {
    const since = { gte: new Date(Date.now() - days * 86400000) };
    const [views, favorites, cartAdds, inquiries, phoneClicks] = await Promise.all([
      this.prisma.propertyViewEvent.count({ where: { viewedAt: since } }),
      this.prisma.favorite.count({ where: { createdAt: since } }),
      this.prisma.cartItem.count({ where: { createdAt: since } }),
      this.prisma.inquiry.count({ where: { createdAt: since } }),
      this.prisma.propertyPhoneClickEvent.count({ where: { clickedAt: since } }),
    ]);
    return [
      { step: 'Property Views', value: views },
      { step: 'Favorites', value: favorites },
      { step: 'Cart Adds', value: cartAdds },
      { step: 'Inquiries', value: inquiries },
      { step: 'Phone Clicks', value: phoneClicks },
    ];
  }

  /** Daily multi-series activity (engagement + growth) for the trend charts. */
  async analyticsActivity(days = 30) {
    const since = { gte: new Date(Date.now() - days * 86400000) };
    const [views, searches, inquiries, phoneClicks, favorites, cartAdds, shares, listings, users, questions, answers] =
      await Promise.all([
        this.prisma.propertyViewEvent.findMany({ where: { viewedAt: since }, select: { viewedAt: true } }),
        this.prisma.propertySearchEvent.findMany({ where: { searchedAt: since }, select: { searchedAt: true } }),
        this.prisma.inquiry.findMany({ where: { createdAt: since }, select: { createdAt: true } }),
        this.prisma.propertyPhoneClickEvent.findMany({ where: { clickedAt: since }, select: { clickedAt: true } }),
        this.prisma.favorite.findMany({ where: { createdAt: since }, select: { createdAt: true } }),
        this.prisma.cartItem.findMany({ where: { createdAt: since }, select: { createdAt: true } }),
        this.prisma.propertyShareEvent.findMany({ where: { sharedAt: since }, select: { sharedAt: true } }),
        this.prisma.property.findMany({ where: { createdAt: since }, select: { createdAt: true } }),
        this.prisma.user.findMany({ where: { createdAt: since }, select: { createdAt: true } }),
        this.prisma.question.findMany({ where: { createdAt: since }, select: { createdAt: true } }),
        this.prisma.answer.findMany({ where: { createdAt: since }, select: { createdAt: true } }),
      ]);

    const key = (d: Date) => d.toISOString().slice(0, 10);
    const buckets = await this.dailyBuckets(days, [
      'views', 'searches', 'inquiries', 'phoneClicks', 'favorites', 'cartAdds', 'shares', 'listings', 'users', 'questions', 'answers',
    ]);
    const bump = (date: Date, field: string) => { const b = buckets.get(key(date)); if (b) b[field]++; };
    for (const r of views) bump(r.viewedAt, 'views');
    for (const r of searches) bump(r.searchedAt, 'searches');
    for (const r of inquiries) bump(r.createdAt, 'inquiries');
    for (const r of phoneClicks) bump(r.clickedAt, 'phoneClicks');
    for (const r of favorites) bump(r.createdAt, 'favorites');
    for (const r of cartAdds) bump(r.createdAt, 'cartAdds');
    for (const r of shares) bump(r.sharedAt, 'shares');
    for (const r of listings) bump(r.createdAt, 'listings');
    for (const r of users) bump(r.createdAt, 'users');
    for (const r of questions) bump(r.createdAt, 'questions');
    for (const r of answers) bump(r.createdAt, 'answers');
    return Array.from(buckets.values());
  }

  /** Top-performing listings + property type & status distribution. */
  async analyticsListingPerformance(days = 30) {
    const since = { gte: new Date(Date.now() - days * 86400000) };
    const [viewGroups, byType, byStatus] = await Promise.all([
      this.prisma.propertyViewEvent.groupBy({
        by: ['propertyId'],
        where: { viewedAt: since },
        _count: { _all: true },
        orderBy: { _count: { propertyId: 'desc' } },
        take: 10,
      }),
      this.prisma.property.groupBy({ by: ['propertyType'], _count: { _all: true } }),
      this.prisma.property.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const topIds = viewGroups.map((g) => g.propertyId);
    const [properties, inqGroups, favGroups, phoneGroups] = await Promise.all([
      topIds.length
        ? this.prisma.property.findMany({
            where: { id: { in: topIds } },
            select: {
              id: true, listingCode: true, title: true, slug: true, status: true, propertyType: true, askingPrice: true,
              location: { select: { district: true, municipality: true, areaName: true } },
            },
          })
        : Promise.resolve([]),
      topIds.length
        ? this.prisma.inquiry.groupBy({ by: ['propertyId'], where: { propertyId: { in: topIds }, createdAt: since }, _count: { _all: true } })
        : Promise.resolve([]),
      topIds.length
        ? this.prisma.favorite.groupBy({ by: ['propertyId'], where: { propertyId: { in: topIds }, createdAt: since }, _count: { _all: true } })
        : Promise.resolve([]),
      topIds.length
        ? this.prisma.propertyPhoneClickEvent.groupBy({ by: ['propertyId'], where: { propertyId: { in: topIds }, clickedAt: since }, _count: { _all: true } })
        : Promise.resolve([]),
    ]);

    const countMap = (groups: { propertyId: string; _count: { _all: number } }[]) =>
      new Map(groups.map((g) => [g.propertyId, g._count._all]));
    const viewsMap = new Map(viewGroups.map((g) => [g.propertyId, g._count._all]));
    const inqMap = countMap(inqGroups);
    const favMap = countMap(favGroups);
    const phoneMap = countMap(phoneGroups);

    const top = properties
      .map((p) => ({
        id: p.id,
        listingCode: p.listingCode,
        title: p.title,
        slug: p.slug,
        status: p.status,
        propertyType: p.propertyType,
        askingPrice: Number(p.askingPrice),
        location: p.location ? `${p.location.areaName || p.location.municipality}, ${p.location.district}` : '—',
        views: viewsMap.get(p.id) ?? 0,
        inquiries: inqMap.get(p.id) ?? 0,
        favorites: favMap.get(p.id) ?? 0,
        phoneClicks: phoneMap.get(p.id) ?? 0,
      }))
      .sort((a, b) => b.views - a.views);

    return { top, byType, byStatus };
  }

  /** Monthly asking-price trend + sold-price (comps) trend for market intelligence. */
  async analyticsMarket(days = 365) {
    const since = { gte: new Date(Date.now() - days * 86400000) };
    const [properties, sales] = await Promise.all([
      this.prisma.property.findMany({
        where: { status: { in: ['LIVE', 'SOLD'] }, createdAt: since },
        select: { createdAt: true, askingPrice: true },
      }),
      this.prisma.propertySaleRecord.findMany({
        where: { soldDate: since },
        select: { soldDate: true, soldPrice: true, soldPricePerAana: true },
      }),
    ]);

    const key = (d: Date) => d.toISOString().slice(0, 7); // YYYY-MM
    const months = new Map<string, { month: string; avgAsking: number; listingCount: number; avgSold: number; soldCount: number; avgSoldPerAana: number }>();
    const ensure = (k: string) => {
      if (!months.has(k)) months.set(k, { month: k, avgAsking: 0, listingCount: 0, avgSold: 0, soldCount: 0, avgSoldPerAana: 0 });
      return months.get(k)!;
    };
    for (const p of properties) { const b = ensure(key(p.createdAt)); b.avgAsking += Number(p.askingPrice); b.listingCount++; }
    for (const s of sales) { const b = ensure(key(s.soldDate)); b.avgSold += Number(s.soldPrice); b.avgSoldPerAana += Number(s.soldPricePerAana ?? 0); b.soldCount++; }
    for (const b of months.values()) {
      if (b.listingCount) b.avgAsking = Math.round(b.avgAsking / b.listingCount);
      if (b.soldCount) { b.avgSold = Math.round(b.avgSold / b.soldCount); b.avgSoldPerAana = Math.round(b.avgSoldPerAana / b.soldCount); }
    }
    return Array.from(months.values()).sort((a, b) => (a.month < b.month ? -1 : 1));
  }

  /** Top search queries + top districts users searched for. */
  async analyticsSearchInsights(days = 30) {
    const since = { gte: new Date(Date.now() - days * 86400000) };
    const [queryGroups, propertyGroups] = await Promise.all([
      this.prisma.propertySearchEvent.groupBy({
        by: ['searchQuery'],
        where: { searchedAt: since, searchQuery: { not: '' } },
        _count: { _all: true },
        orderBy: { _count: { searchQuery: 'desc' } },
        take: 10,
      }),
      this.prisma.propertySearchEvent.groupBy({
        by: ['propertyId'],
        where: { searchedAt: since, propertyId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { propertyId: 'desc' } },
        take: 100,
      }),
    ]);

    const topQueries = queryGroups
      .filter((g) => g.searchQuery)
      .map((g) => ({ query: g.searchQuery as string, count: g._count._all }));

    const ids = propertyGroups.map((g) => g.propertyId as string);
    const properties = ids.length
      ? await this.prisma.property.findMany({
          where: { id: { in: ids } },
          select: { id: true, location: { select: { district: true, municipality: true } } },
        })
      : [];
    const districtCount = new Map<string, number>();
    const propCount = new Map(propertyGroups.map((g) => [g.propertyId as string, g._count._all]));
    for (const p of properties) {
      const district = p.location?.district;
      if (!district) continue;
      districtCount.set(district, (districtCount.get(district) ?? 0) + (propCount.get(p.id) ?? 0));
    }
    const topDistricts = Array.from(districtCount.entries())
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { topQueries, topDistricts };
  }

  /** Lead quality: inquiries by type, status and verified flag. */
  async analyticsLeads(days = 30) {
    const since = { gte: new Date(Date.now() - days * 86400000) };
    const [byType, byStatus, byVerified, total] = await Promise.all([
      this.prisma.inquiry.groupBy({ by: ['type'], where: { createdAt: since }, _count: { _all: true } }),
      this.prisma.inquiry.groupBy({ by: ['status'], where: { createdAt: since }, _count: { _all: true } }),
      this.prisma.inquiry.groupBy({ by: ['isVerifiedLead'], where: { createdAt: since }, _count: { _all: true } }),
      this.prisma.inquiry.count({ where: { createdAt: since } }),
    ]);
    return { byType, byStatus, byVerified, total };
  }

  /** Geographic demand: property views aggregated by district. */
  async analyticsGeography(days = 30) {
    const since = { gte: new Date(Date.now() - days * 86400000) };
    const viewGroups = await this.prisma.propertyViewEvent.groupBy({
      by: ['propertyId'],
      where: { viewedAt: since },
      _count: { _all: true },
      orderBy: { _count: { propertyId: 'desc' } },
      take: 50,
    });
    const ids = viewGroups.map((g) => g.propertyId);
    const properties = ids.length
      ? await this.prisma.property.findMany({
          where: { id: { in: ids } },
          select: { id: true, location: { select: { district: true } } },
        })
      : [];
    const propCount = new Map(viewGroups.map((g) => [g.propertyId, g._count._all]));
    const byDistrict = new Map<string, number>();
    for (const p of properties) {
      const district = p.location?.district;
      if (!district) continue;
      byDistrict.set(district, (byDistrict.get(district) ?? 0) + (propCount.get(p.id) ?? 0));
    }
    return Array.from(byDistrict.entries())
      .map(([district, views]) => ({ district, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }

  /** Platform health: share channels, appointment pipeline, Q&A activity. */
  async analyticsPlatform(days = 30) {
    const since = { gte: new Date(Date.now() - days * 86400000) };
    const [shares, appointments, questions, answers] = await Promise.all([
      this.prisma.propertyShareEvent.groupBy({ by: ['platform'], where: { sharedAt: since }, _count: { _all: true } }),
      this.prisma.officerAppointment.groupBy({ by: ['status'], where: { createdAt: since }, _count: { _all: true } }),
      this.prisma.question.findMany({ where: { createdAt: since }, select: { createdAt: true } }),
      this.prisma.answer.findMany({ where: { createdAt: since }, select: { createdAt: true } }),
    ]);

    const key = (d: Date) => d.toISOString().slice(0, 10);
    const qa = new Map<string, { date: string; questions: number; answers: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const k = key(new Date(Date.now() - i * 86400000));
      qa.set(k, { date: k, questions: 0, answers: 0 });
    }
    for (const q of questions) { const b = qa.get(key(q.createdAt)); if (b) b.questions++; }
    for (const a of answers) { const b = qa.get(key(a.createdAt)); if (b) b.answers++; }

    return {
      sharesByPlatform: shares.map((s) => ({ platform: s.platform, count: s._count._all })),
      appointmentsByStatus: appointments.map((a) => ({ status: a.status, count: a._count._all })),
      qaActivity: Array.from(qa.values()),
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

  /**
   * Admin changes their own account email directly in the database.
   * The two-step Better Auth email-verification flow is not used here because
   * it depends on the operator receiving and clicking confirmation links —
   * for an authenticated ADMIN session, an immediate update is expected.
   */
  async updateAccountEmail(actorId: string, newEmail: string) {
    const email = String(newEmail ?? '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Please enter a valid email address');
    }
    const me = await this.prisma.user.findUnique({ where: { id: actorId } });
    if (!me) throw new NotFoundException('User not found');
    if (me.email.toLowerCase() === email) {
      throw new BadRequestException('New email is the same as the current email');
    }
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('That email is already in use by another account');
    }
    const updated = await this.prisma.user.update({
      where: { id: actorId },
      data: { email },
      select: { id: true, name: true, email: true, role: true },
    });
    await this.audit(actorId, 'email_change', 'user', actorId, `Changed own email to ${email}`);
    return updated;
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

  /** Full property record (with nested content) for the admin edit screen. */
  async getPropertyAdmin(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        location: true,
        landArea: true,
        cadastralRecord: true,
        media: { orderBy: { sortOrder: 'asc' } },
        documents: { orderBy: { uploadedAt: 'desc' } },
        owner: { select: { id: true, name: true, email: true } },
        agent: { select: { id: true, name: true, email: true } },
        analytics: true,
      },
    });
    if (!property) throw new NotFoundException(`Property ${id} not found`);
    return property;
  }

  /**
   * Admin content edit: title, description, pricing, specs, location, land
   * area and media gallery. Unlike seller edits, an admin change does NOT
   * reset verificationLevel — the admin is the reviewing authority.
   */
  async updatePropertyAdmin(actorId: string, id: string, input: UpdatePropertyAdminInput) {
    const { location, landArea, media, documents: _documents, ...rest } = input;
    const existing = await this.prisma.property.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Property ${id} not found`);

    const property = await this.prisma.property.update({
      where: { id },
      data: {
        ...(rest as any),
        // Nested one-to-one records — upsert so a second edit doesn't violate
        // the @unique FK, mirroring PropertiesService.update.
        ...(location && {
          location: { upsert: { create: location as any, update: location as any } },
        }),
        ...(landArea && {
          landArea: { upsert: { create: landArea as any, update: landArea as any } },
        }),
        // Media is replaced wholesale when provided (even an empty array
        // clears the gallery). `undefined` leaves it untouched.
        ...(media !== undefined && {
          media: {
            deleteMany: {},
            create: media.map((m, index) => ({
              url: m.url,
              altText: m.altText,
              type: m.type ?? 'IMAGE',
              sortOrder: m.sortOrder ?? index,
              isCover: m.isCover ?? index === 0,
            })),
          },
        }),
      },
      include: {
        location: true,
        landArea: true,
        media: { orderBy: { sortOrder: 'asc' } },
      },
    });
    await this.audit(actorId, 'edit', 'property', id, `Edited property ${property.listingCode} content`);
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
