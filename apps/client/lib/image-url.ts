/**
 * URL-level image optimization for the two CDNs this app sources imagery
 * from (Cloudinary and Unsplash). Returns a URL resized to `width` px with
 * automatic format + quality negotiation, so images are never shipped at
 * their upload dimensions when they render far smaller.
 *
 * Cloudinary URL anatomy (transforms MUST precede the version segment):
 *   /image/upload/{transform-chain}/v{version}/{path}
 */

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
