import { Injectable } from '@nestjs/common';
import { ContentPlacement, ContentSlot, PrismaClient } from '@repo/db';

export interface UpsertContentItemDto {
  key: string;
  title?: string;
  subtitle?: string;
  body?: string;
  image?: string;
  ctaLabel?: string;
  ctaHref?: string;
  metadata?: Record<string, unknown>;
  sortOrder?: number;
  published?: boolean;
}

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaClient) {}

  async listItems(
    placement: ContentPlacement,
    slot?: ContentSlot,
    opts: { includeUnpublished?: boolean } = {},
  ) {
    const where: Record<string, unknown> = {
      placement,
      ...(slot ? { slot } : {}),
      ...(opts.includeUnpublished ? {} : { published: true }),
    };
    return this.prisma.contentItem.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async getItem(id: string) {
    return this.prisma.contentItem.findUnique({ where: { id } });
  }

  async upsertItem(actorId: string, placement: ContentPlacement, slot: ContentSlot, dto: UpsertContentItemDto) {
    const item = await this.prisma.contentItem.upsert({
      where: { placement_slot_key: { placement, slot, key: dto.key } },
      create: {
        placement, slot, key: dto.key,
        title: dto.title, subtitle: dto.subtitle, body: dto.body, image: dto.image,
        ctaLabel: dto.ctaLabel, ctaHref: dto.ctaHref, metadata: dto.metadata as any,
        sortOrder: dto.sortOrder ?? 0, published: dto.published ?? true, createdById: actorId,
      },
      update: {
        title: dto.title, subtitle: dto.subtitle, body: dto.body, image: dto.image,
        ctaLabel: dto.ctaLabel, ctaHref: dto.ctaHref, metadata: dto.metadata as any,
        sortOrder: dto.sortOrder, published: dto.published,
      },
    });
    await this.audit(actorId, 'upsert', 'content_item', item.id, `Upserted ${slot} ${placement} '${dto.key}'`);
    return item;
  }

  async updateItem(actorId: string, id: string, patch: Partial<UpsertContentItemDto>) {
    const item = await this.prisma.contentItem.update({
      where: { id },
      data: {
        title: patch.title, subtitle: patch.subtitle, body: patch.body, image: patch.image,
        ctaLabel: patch.ctaLabel, ctaHref: patch.ctaHref, metadata: patch.metadata as any,
        sortOrder: patch.sortOrder, published: patch.published,
      },
    });
    await this.audit(actorId, 'update', 'content_item', id, `Updated ${item.slot} '${item.key}'`);
    return item;
  }

  async setPublished(actorId: string, id: string, published: boolean) {
    const item = await this.prisma.contentItem.update({ where: { id }, data: { published } });
    await this.audit(actorId, published ? 'publish' : 'unpublish', 'content_item', id, `${published ? 'Published' : 'Unpublished'} ${item.slot} '${item.key}'`);
    return item;
  }

  async reorder(actorId: string, placement: ContentPlacement, slot: ContentSlot, ids: string[]) {
    const result = await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.contentItem.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
    await this.audit(actorId, 'reorder', `content_item:${slot}`, placement, `Reordered ${ids.length} items in ${slot}`);
    return result;
  }

  async removeItem(actorId: string, id: string) {
    const item = await this.prisma.contentItem.delete({ where: { id } });
    await this.audit(actorId, 'delete', 'content_item', id, `Deleted ${item.slot} '${item.key}'`);
    return { deleted: true, id };
  }

  // ---- Static pages / nav / footer / SEO ----

  async listStaticPages() {
    return this.prisma.staticPage.findMany({ orderBy: { slug: 'asc' } });
  }

  async upsertStaticPage(actorId: string, dto: { slug: string; route: string; title?: string; body?: string; published?: boolean }) {
    const page = await this.prisma.staticPage.upsert({
      where: { slug: dto.slug }, create: dto, update: dto,
    });
    await this.audit(actorId, 'upsert', 'static_page', page.id, `Upserted static page '${dto.slug}'`);
    return page;
  }

  async listNav() { return this.prisma.navItem.findMany({ orderBy: { sortOrder: 'asc' } }); }
  async upsertNav(actorId: string, dto: { id?: string; label: string; href: string; sortOrder?: number; published?: boolean }) {
    const nav = dto.id
      ? await this.prisma.navItem.update({ where: { id: dto.id }, data: dto })
      : await this.prisma.navItem.create({ data: dto });
    await this.audit(actorId, 'upsert', 'nav_item', nav.id, `Upserted nav '${nav.label}'`);
    return nav;
  }

  async listFooter() { return this.prisma.footerLink.findMany({ orderBy: [{ column: 'asc' }, { sortOrder: 'asc' }] }); }
  async upsertFooter(actorId: string, dto: { id?: string; column: string; label: string; href: string; sortOrder?: number }) {
    const link = dto.id
      ? await this.prisma.footerLink.update({ where: { id: dto.id }, data: dto })
      : await this.prisma.footerLink.create({ data: dto });
    await this.audit(actorId, 'upsert', 'footer_link', link.id, `Upserted footer link '${link.label}'`);
    return link;
  }

  async listSeo() { return this.prisma.seoConfig.findMany({ orderBy: { route: 'asc' } }); }
  async upsertSeo(actorId: string, dto: { route: string; title?: string; description?: string; keywords?: string; robots?: string }) {
    const seo = await this.prisma.seoConfig.upsert({ where: { route: dto.route }, create: dto, update: dto });
    await this.audit(actorId, 'upsert', 'seo_config', seo.id, `Upserted SEO for '${dto.route}'`);
    return seo;
  }

  // ---- Audit ----

  async audit(actorId: string, action: string, entity: string, entityId: string | null | undefined, summary: string, payload?: unknown) {
    if (!actorId) return;
    try {
      await this.prisma.adminAuditLog.create({
        data: { actorId, action, entity, entityId: entityId ?? undefined, summary, payload: payload as any },
      });
    } catch {
      // never block a write because auditing failed
    }
  }
}
