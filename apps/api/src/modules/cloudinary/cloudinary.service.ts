import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
import { CLOUDINARY } from './cloudinary.constants';
import {
  CloudinaryUploadOptions,
  CloudinaryUploadResult,
} from './cloudinary.types';

/**
 * Thin, reusable wrapper around the Cloudinary SDK.
 *
 * Register {@link CloudinaryModule} once (it is @Global) and inject this
 * service anywhere — controllers, services, resolvers — to upload or delete
 * assets without re-declaring the SDK or its configuration.
 */
@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(@Inject(CLOUDINARY) private readonly client: typeof cloudinary) {}

  /**
   * Upload a single in-memory file (already validated by multer).
   *
   * ```ts
   * const res = await this.cloudinary.uploadBuffer(file.buffer, {
   *   folder: 'properties',
   *   tags: 'listing-asset',
   * });
   * ```
   */
  uploadBuffer(
    buffer: Buffer,
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult> {
    const {
      folder,
      tags,
      resourceType = 'auto',
      publicId,
      uploadOptions = {},
    } = options;

    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const stream = this.client.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder,
          tags,
          public_id: publicId,
          ...uploadOptions,
        },
        (
          error: UploadApiErrorResponse | undefined,
          result?: UploadApiResponse,
        ) => {
          if (error) {
            this.logger.error(
              `Cloudinary upload failed: ${error.message}`,
              error.stack,
            );
            reject(
              new BadRequestException(
                error.message ?? 'Cloudinary upload failed',
              ),
            );
            return;
          }
          if (!result) {
            reject(
              new InternalServerErrorException(
                'Cloudinary returned an empty upload result',
              ),
            );
            return;
          }
          resolve(this.toResult(result));
        },
      );
      stream.end(buffer);
    });
  }

  /**
   * Upload several files, returning an array of results sourced via
   * {@link uploadBuffer}. Failures reject the whole batch so callers never get
   * a partially uploaded set without noticing.
   */
  async uploadMany(
    files: { buffer: Buffer; originalname?: string }[],
    options: CloudinaryUploadOptions = {},
  ): Promise<CloudinaryUploadResult[]> {
    return Promise.all(
      files.map((file) =>
        this.uploadBuffer(file.buffer, options).then((result) => ({
          ...result,
          originalFilename: file.originalname,
        })),
      ),
    );
  }

  /**
   * Delete a single resource (permanent by default).
   *
   * @param publicId Asset public id, e.g. the value returned by
   * {@link CloudinaryUploadResult.publicId}.
   * @param resourceType Cloudinary resource type used for deletion
   * (`image` | `raw` | `video`). Defaults to `image`; pass `raw` for PDFs/docs.
   */
  async delete(
    publicId: string,
    resourceType: 'image' | 'raw' | 'video' = 'image',
  ): Promise<{ result: string }> {
    if (!publicId) {
      throw new BadRequestException('publicId is required to delete an asset');
    }

    await this.client.api.delete_resources([publicId], {
      type: 'upload',
      resource_type: resourceType,
    });

    const resource = await this.findResource(publicId).catch(() => null);
    return { result: resource ? 'not found' : 'ok' };
  }

  /**
   * Delete multiple resources in one upstream call.
   */
  async deleteMany(
    publicIds: string[],
    resourceType: 'image' | 'raw' | 'video' = 'image',
  ): Promise<{ deleted: string[] }> {
    const uniqueIds = [...new Set(publicIds.filter(Boolean))];
    if (uniqueIds.length === 0) return { deleted: [] };

    await this.client.api.delete_resources(uniqueIds, {
      type: 'upload',
      resource_type: resourceType,
    });

    return { deleted: uniqueIds };
  }

  /**
   * Look up an existing resource by public id. Useful to verify ownership or
   * existence before linking an asset to a record.
   */
  async findResource(publicId: string): Promise<CloudinaryUploadResult | null> {
    try {
      const raw: unknown = await this.client.api.resource(publicId, {
        resource_type: 'auto',
      });
      return this.toResult(raw as UploadApiResponse);
    } catch (error) {
      const status = (error as { http_code?: number })?.http_code;
      if (status === 404) return null;
      throw error;
    }
  }

  /** Map a native Cloudinary response into our normalized result. */
  private toResult(result: UploadApiResponse): CloudinaryUploadResult {
    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      originalFilename: result.original_filename,
    };
  }
}
