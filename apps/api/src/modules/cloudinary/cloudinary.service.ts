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

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(@Inject(CLOUDINARY) private readonly client: typeof cloudinary) {}

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
