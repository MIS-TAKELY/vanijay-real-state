import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { CloudinaryUploadResult } from '../../cloudinary/cloudinary.types';
import { UploadedFile } from './multer.config';

export type UploadFolder =
  | 'properties'
  | 'profiles'
  | 'documents'
  | 'identity'
  | 'misc';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  uploadFile(
    file: UploadedFile,
    folder: UploadFolder = 'misc',
  ): Promise<CloudinaryUploadResult> {
    return this.cloudinary.uploadBuffer(file.buffer, {
      folder,
      tags: [`${folder}:upload`, `user_upload`],
    });
  }

  async uploadFiles(
    files: UploadedFile[],
    folder: UploadFolder = 'misc',
  ): Promise<CloudinaryUploadResult[]> {
    if (files.length === 0) return [];
    return this.cloudinary.uploadMany(files, { folder });
  }

  deleteFile(publicId: string): Promise<{ result: string }> {
    return this.cloudinary.delete(publicId);
  }

  deleteFiles(publicIds: string[]): Promise<{ deleted: string[] }> {
    return this.cloudinary.deleteMany(publicIds);
  }
}
