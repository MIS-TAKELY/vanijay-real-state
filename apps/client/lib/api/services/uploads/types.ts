/** Result shape returned by the Cloudinary-backed uploads endpoints. */
export interface UploadedAsset {
  publicId: string;
  url: string;
  secureUrl: string;
  format?: string;
  resourceType?: string;
  bytes?: number;
  width?: number;
  height?: number;
  originalFilename?: string;
}
