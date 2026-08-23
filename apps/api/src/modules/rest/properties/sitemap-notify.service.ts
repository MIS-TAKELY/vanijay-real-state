import { Injectable, Logger } from '@nestjs/common';

/**
 * Fire-and-forget ping that tells the Next.js client to regenerate
 * /sitemap.xml after the property inventory changes.
 *
 * Why: the client's sitemap route uses ISR with `revalidate = 3600`, so without
 * this ping a newly published listing would only enter the sitemap up to an
 * hour later (and a deleted one would linger just as long). Calling
 * `POST {CLIENT_INTERNAL_URL}/api/revalidate/sitemap` triggers an on-demand
 * `revalidatePath('/sitemap.xml')` instead.
 *
 * Design notes:
 * - NEVER awaited by callers — a slow/unreachable client must not fail or slow
 *   the create/update/delete mutation itself.
 * - Best-effort: failures are logged at warn level and swallowed. Even when
 *   the ping fails, the hourly ISR fallback still refreshes the sitemap.
 */
@Injectable()
export class SitemapNotifyService {
  private readonly logger = new Logger(SitemapNotifyService.name);

  /** Shared secret; must match SITEMAP_REVALIDATE_SECRET on the client app. */
  private readonly secret = process.env.SITEMAP_REVALIDATE_SECRET ?? '';

  /**
   * Where to reach the Next.js client for the revalidation ping.
   *
   * Prefers CLIENT_INTERNAL_URL (Docker DNS, e.g. http://client:3000) because
   * server-to-server calls through the PUBLIC origin (CLIENT_URL) hairpin out
   * via Cloudflare/Traefik and can 403/timeout — the same reason
   * lib/api/core/config.ts#serverApiUrl exists on the client side.
   * Falls back to CLIENT_URL so deployments that skip the extra var still get
   * best-effort pings (failures are logged; the hourly ISR refresh remains),
   * and finally localhost for bare local dev.
   */
  private readonly clientUrl =
    process.env.CLIENT_INTERNAL_URL ??
    process.env.CLIENT_URL ??
    'http://localhost:3000';

  notifySitemapChanged(): void {
    if (!this.secret || !this.clientUrl) {
      // Not configured (e.g. local dev without the env vars) — skip silently;
      // the hourly ISR revalidation still keeps the sitemap fresh.
      return;
    }

    const url = `${this.clientUrl}/api/revalidate/sitemap`;
    void fetch(url, {
      method: 'POST',
      headers: { 'x-revalidate-secret': this.secret },
      // Don't let a hung client hold resources — abort after 5s.
      signal: AbortSignal.timeout(5_000),
    }).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Sitemap revalidate ping to ${url} failed (sitemap refreshes within the hour anyway): ${message}`,
      );
    });
  }
}