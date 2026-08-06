import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { CloudinaryUploadResult } from '../../cloudinary/cloudinary.types';
import { UploadedFile } from './multer.config';

/** Group assets by a logical domain, e.g. "properties", "profiles", "documents". */
export type UploadFolder =
  | 'properties'
  | 'profiles'
  | 'documents'
  | 'identity'
  | 'misc';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  /** Upload a single file into the given folder. */
  uploadFile(
    file: UploadedFile,
    folder: UploadFolder = 'misc',
  ): Promise<CloudinaryUploadResult> {
    return this.cloudinary.uploadBuffer(file.buffer, {
      folder,
      tags: [`${folder}:upload`, `user_upload`],
    });
  }

  /** Upload several files into the given folder, preserving original names. */
  async uploadFiles(
    files: UploadedFile[],
    folder: UploadFolder = 'misc',
  ): Promise<CloudinaryUploadResult[]> {
    if (files.length === 0) return [];
    return this.cloudinary.uploadMany(files, { folder });
  }

  /** Delete a single asset by its Cloudinary public id. */
  deleteFile(publicId: string): Promise<{ result: string }> {
    return this.cloudinary.delete(publicId);
  }

  /** Delete several assets by their Cloudinary public ids. */
  deleteFiles(publicIds: string[]): Promise<{ deleted: string[] }> {
    return this.cloudinary.deleteMany(publicIds);
  }
}
