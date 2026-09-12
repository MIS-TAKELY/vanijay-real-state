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
    return `${secureBase}c_fill,g_auto,w_1000,h_1000,f_jpg,q_auto:eco/${assetPath}`;
  }

  try {
    const url = new URL(src);
    if (url.hostname === "images.unsplash.com") {
      url.protocol = "https:";
      url.searchParams.set("w", "1000");
      url.searchParams.set("h", "1000");
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


export const IMAGE_BREAKPOINTS = [320, 480, 640, 768, 1024, 1280, 1536, 1920];

/** Default image widths based on common use cases */
export const IMAGE_WIDTHS = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
  full: 1920,
} as const;

/**
 * Generate a srcSet string from an image URL and widths array.
 * Used for responsive images that need to serve different sizes based on viewport.
 */
export function generateSrcSet(
  src: string,
  widths: number[] = IMAGE_BREAKPOINTS
): string {
  return widths.map((w) => `${optimizeImageUrl(src, w)} ${w}w`).join(", ");
}

/**
 * Get blur data URL for placeholder effect during image loading.
 * Uses a tiny base64 encoded SVG for minimal payload (~200 bytes).
 */
export function getBlurDataURL(
  width: number = 32,
  height: number = 32,
  color: string = "#f0f0f0"
): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`;
}

/**
 * Check if URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string): boolean {
  return CLOUDINARY_BASE.test(url);
}

/**
 * Check if URL is from Unsplash
 */
export function isUnsplashUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "images.unsplash.com";
  } catch {
    return false;
  }
}

/**
 * Calculate recommended img sizing attributes to prevent CLS
 * Returns width, height, and aspect ratio string
 */
export function getImageDimensions(
  naturalWidth: number,
  naturalHeight: number,
  containerWidth: number
): { width: number; height: number; aspectRatio: string } {
  if (!naturalWidth || !naturalHeight) {
    return { width: containerWidth, height: Math.round(containerWidth * 9 / 16), aspectRatio: "16/9" };
  }
  
  const aspectRatio = naturalWidth / naturalHeight;
  const displayWidth = containerWidth;
  const displayHeight = Math.round(containerWidth / aspectRatio);
  
  return {
    width: naturalWidth,
    height: naturalHeight,
    aspectRatio: `${displayWidth}/${displayHeight}`,
  };
}
