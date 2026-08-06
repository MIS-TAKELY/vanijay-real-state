/**
 * Normalized shape returned to callers, wrapping the raw Cloudinary result into
 * a small, API-friendly object. Every field either holds a value or is omitted,
 * so the pagination / DTO layers never have to deal with `null | undefined`.
 */
export interface CloudinaryUploadResult {
  /** Public id of the resource on Cloudinary (used for deletion). */
  publicId: string;
  /** Primary URL (https when `secure` is enabled in the SDK config). */
  url: string;
  /** Secure https URL. */
  secureUrl: string;
  /** Auto-derived format (e.g. jpg, png, pdf). */
  format?: string;
  /** Resource type inferred by Cloudinary (image | video | raw | auto). */
  resourceType?: string;
  /** Byte size of the uploaded resource. */
  bytes?: number;
  /** Width, when an image. */
  width?: number;
  /** Height, when an image. */
  height?: number;
  /** The original filename as sent by the client. */
  originalFilename?: string;
}

/** Options accepted by {@link CloudinaryService.uploadBuffer}. */
export interface CloudinaryUploadOptions {
  /** Folder (path) under which the asset is stored, e.g. "properties". */
  folder?: string;
  /** Grouping tag used for searching / retrieving assets. */
  tags?: string | string[];
  /** Explicit Cloudinary resource_type when auto-detection is not desired. */
  resourceType?: 'auto' | 'image' | 'video' | 'raw';
  /** Any additional native `UploadApiOptions` forwarded to the SDK. */
  uploadOptions?: Record<string, unknown>;
  /** Override the public id (instead of the auto-generated one). */
  publicId?: string;
}
