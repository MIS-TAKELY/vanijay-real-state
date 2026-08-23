/**
 * URL-level image optimization for the two CDNs this app sources imagery
 * from (Cloudinary and Unsplash). Returns a URL resized to `width` px with
 * automatic format + quality negotiation, so images are never shipped at
 * their upload dimensions when they render far smaller.
 */

const CLOUDINARY_UPLOAD =
  /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)((?:[^/,]+,)*[^/,]*)\/(.+)$/;

/** Transformation keys we override — everything else in an existing
 *  Cloudinary transform chain (e.g. `d_download_0`) is preserved. */
const OVERRIDDEN_KEYS = new Set(["w_", "q_", "f_", "c_", "h_", "dpr_"]);

export function optimizeImageUrl(src: string | undefined, width: number): string {
  if (!src) return "";

  const cloudinary = src.match(CLOUDINARY_UPLOAD);
  if (cloudinary) {
    const [, base, existingTransform = "", path] = cloudinary;
    const kept = existingTransform
      .split(",")
      .filter(Boolean)
      .filter((part) => ![...OVERRIDDEN_KEYS].some((k) => part.startsWith(k)));
    const transform = [...kept, "f_auto", "q_auto", `w_${width}`].join(",");
    return `${base}${transform}/${path}`;
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
