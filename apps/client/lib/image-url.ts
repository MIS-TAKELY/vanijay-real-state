/**
 * URL-level image optimization for the two CDNs this app sources imagery
 * from (Cloudinary and Unsplash). Returns a URL resized to `width` px with
 * automatic format + quality negotiation, so images are never shipped at
 * their upload dimensions when they render far smaller.
 *
 * Cloudinary URL anatomy (transforms MUST precede the version segment):
 *   /image/upload/{transform-chain}/v{version}/{path}
 */

import { SITE_URL } from "./site";

const CLOUDINARY_BASE =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.*)$/;

/** Leading version segment, e.g. `v1787226973/`. */
const VERSION_SEGMENT = /^v\d+\//;

/** Transformation keys we override — everything else in an existing
 *  Cloudinary transform chain (e.g. `d_download_0`) is preserved. */
const OVERRIDDEN_KEYS = ["w_", "q_", "f_", "c_", "h_", "dpr_"];

export function optimizeImageUrl(src: string | undefined, width: number): string {
  if (!src) return "";

  const cloudinary = src.match(CLOUDINARY_BASE);
  if (cloudinary) {
    const [, base, rest = ""] = cloudinary;

    // Split the first path segment off; it is either a transform chain,
    // a version segment, or (rarely) the start of the asset path.
    const slashIdx = rest.indexOf("/");
    const head = slashIdx === -1 ? rest : rest.slice(0, slashIdx);
    let tail = slashIdx === -1 ? "" : rest.slice(slashIdx + 1);

    let kept: string[] = [];
    if (head.includes(",")) {
      // Multi-component transform chain — filter out keys we override.
      kept = head
        .split(",")
        .filter(Boolean)
        .filter((part) => !OVERRIDDEN_KEYS.some((k) => part.startsWith(k)));
    } else if (VERSION_SEGMENT.test(`${head}/`)) {
      // Bare version segment — must be re-emitted AFTER our transforms.
      tail = tail ? `${tail}` : "";
      return `${base}f_auto,q_auto,w_${width}/${head}${tail ? `/${tail}` : ""}`;
    }
    // else: no transform chain present — just prepend ours.

    const transform = [...kept, "f_auto", "q_auto", `w_${width}`].join(",");
    return `${base}${transform}/${tail}`;
  }

  try {
    const url = new URL(src);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.set("auto", "format");
      url.searchParams.set("q", "70");
      url.searchParams.set("w", String(width));
      if (!url.searchParams.get("fit")) url.searchParams.set("fit", "crop");
      return url.toString();
    }
    return src;
  } catch {
    return src;
  }
}

/**
 * Generates an optimized OpenGraph / social share image URL (< 300KB)
 * formatted specifically for WhatsApp, Facebook, Twitter, and LinkedIn crawlers.
 *
 * WhatsApp crawler has a hard limit: images > 300KB are completely dropped,
 * showing only a text card without any image thumbnail.
 *
 * This function:
 * 1. Resizes to standard 1200x630 (1.91:1) OpenGraph dimensions with center crop.
 * 2. Forces JPEG (`f_jpg`), avoiding uncompressed PNGs or crawler-incompatible formats.
 * 3. Applies eco compression (`q_auto:eco`) ensuring payload stays well under 300KB (~120-180KB).
 * 4. Ensures the URL is absolute HTTPS (using SITE_URL for relative paths).
 */
export function getSocialOgImageUrl(src: string | undefined): string | undefined {
  if (!src) return undefined;

  const cloudinary = src.match(CLOUDINARY_BASE);
  if (cloudinary && cloudinary[1]) {
    const base = cloudinary[1];
    const rest = cloudinary[2] ?? "";
    const parts = rest.split("/");
    let assetPathIndex = 0;
    const firstSegment = parts[0];
    if (
      firstSegment &&
      (firstSegment.includes(",") ||
        /^(?:[a-z]{1,3}_|dpr_|fl_|pg_)/i.test(firstSegment))
    ) {
      assetPathIndex = 1;
    }
    const assetPath = parts.slice(assetPathIndex).join("/");
    const secureBase = base.replace(/^http:/, "https:");
    return `${secureBase}c_fill,w_1200,h_630,f_jpg,q_auto:eco/${assetPath}`;
  }

  try {
    const url = new URL(src);
    if (url.hostname === "images.unsplash.com") {
      url.protocol = "https:";
      url.searchParams.set("w", "1200");
      url.searchParams.set("h", "630");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("fm", "jpg");
      url.searchParams.set("q", "75");
      return url.toString();
    }
    if (url.protocol === "http:") {
      url.protocol = "https:";
      return url.toString();
    }
    if (url.pathname === "/og-home.png" || url.pathname.endsWith("/og-home.png")) {
      url.pathname = url.pathname.replace(/\/og-home\.png$/, "/og-home.jpg");
      return url.toString();
    }
    return src;
  } catch {
    if (src === "/og-home.png" || src.endsWith("/og-home.png")) {
      return `${SITE_URL}/og-home.jpg`;
    }
    if (src.startsWith("/")) {
      return `${SITE_URL}${src}`;
    }
    return src;
  }
}
