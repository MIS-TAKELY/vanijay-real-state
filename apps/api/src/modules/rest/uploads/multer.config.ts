import { BadRequestException } from '@nestjs/common';

/**
 * Reusable in-memory multer options for Cloudinary-backed uploads.
 *
 * Export this from the owning module so any feature (profile photos, listing
 * media, document vault, …) can share the exact same validation rules:
 *
 * ```ts
 * @Post('avatar')
 * @UseInterceptors(FileInterceptor('file', createMulterOptions()))
 * uploadAvatar(@UploadedFile() file: UploadedFile) { ... }
 * ```
 */

/** Shape of a multer memory-storage file (avoids depending on @types/multer). */
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/** Common image formats rendered by the browser / CDN. */
export const IMAGE_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
] as const;

/** Document / raw formats relevant to a real-estate platform. */
export const DOCUMENT_MIMETYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
] as const;

/** Every asset accepted by default. */
export const ACCEPTED_ASSET_MIMETYPES: readonly string[] = [
  ...IMAGE_MIMETYPES,
  ...DOCUMENT_MIMETYPES,
];

/** Default ceiling for a single uploaded file: 10 MB. */
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Default ceiling for the number of files accepted by one request. */
export const DEFAULT_MAX_FILES = 20;

export interface MulterOptionsConfig {
  /** Mime types allowed through the file filter. Defaults to all assets. */
  allowedMimeTypes?: readonly string[];
  /** Maximum single-file size in bytes. Defaults to 10 MB. */
  maxFileSize?: number;
  /** Maximum number of files per field/request. Defaults to 20. */
  maxFiles?: number;
}

/**
 * Build multer options loaded in memory (buffer available in the controller),
 * with consistent limits and a file-type guard that rejects unknown mime types
 * with a 400 response.
 */
export function createMulterOptions(
  config: MulterOptionsConfig = {},
): Record<string, unknown> {
  const {
    allowedMimeTypes = ACCEPTED_ASSET_MIMETYPES,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    maxFiles = DEFAULT_MAX_FILES,
  } = config;

  return {
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },
    fileFilter: (
      req: unknown,
      file: { mimetype: string },
      cb: (error: Error | null, accept: boolean) => void,
    ) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
      }
      cb(
        new BadRequestException(
          `Unsupported file type "${file.mimetype}". Allowed: ${allowedMimeTypes.join(', ')}`,
        ),
        false,
      );
    },
  };
}
