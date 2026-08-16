import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@repo/db';

const MAIN_KEY = 'main';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getConfig() {
    const row = await this.prisma.siteConfig.findUnique({
      where: { key: MAIN_KEY },
    });
    return row?.data ?? null;
  }

  async updateConfig(actorId: string, data: Record<string, unknown>) {
    const row = await this.prisma.siteConfig.upsert({
      where: { key: MAIN_KEY },
      create: { key: MAIN_KEY, data: data as any },
      update: { data: data as any },
    });
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          actorId,
          action: 'update',
          entity: 'site_config',
          entityId: row.id,
          summary: 'Updated site settings',
        },
      });
    } catch {
      /* no-op */
    }
    return row.data;
  }
}
