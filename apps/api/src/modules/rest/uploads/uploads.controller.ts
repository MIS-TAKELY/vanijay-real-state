import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../../../common/guards/auth.guard';
import {
  createMulterOptions,
  DEFAULT_MAX_FILE_SIZE,
  VIDEO_MAX_FILE_SIZE,
  VIDEO_MIMETYPES,
  UploadedFile as UploadedFileType,
} from './multer.config';
import { UploadFolder, UploadsService } from './uploads.service';

const uploadOptions = createMulterOptions({
  maxFileSize: VIDEO_MAX_FILE_SIZE,
});

const VALID_FOLDERS: UploadFolder[] = [
  'properties',
  'profiles',
  'documents',
  'identity',
  'misc',
];

function resolveFolder(value?: string): UploadFolder {
  if (!value) return 'misc';
  if (!VALID_FOLDERS.includes(value as UploadFolder)) {
    throw new BadRequestException(
      `Invalid folder "${value}". Allowed: ${VALID_FOLDERS.join(', ')}`,
    );
  }
  return value as UploadFolder;
}

function assertFileSize(file: UploadedFileType) {
  const isVideo = (VIDEO_MIMETYPES as readonly string[]).includes(
    file.mimetype,
  );
  const maxBytes = isVideo ? VIDEO_MAX_FILE_SIZE : DEFAULT_MAX_FILE_SIZE;
  if (file.size > maxBytes) {
    throw new BadRequestException(
      `File too large. Maximum is ${Math.round(maxBytes / (1024 * 1024))} MB for this type.`,
    );
  }
}

@Controller('api/v1/uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', uploadOptions))
  uploadSingle(
    @UploadedFile() file: UploadedFileType | undefined,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('A "file" field is required');
    }
    assertFileSize(file);
    return this.uploads.uploadFile(file, resolveFolder(folder));
  }

  @Post('multiple')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', 20, uploadOptions))
  uploadMultiple(
    @UploadedFiles() files: UploadedFileType[] | undefined,
    @Query('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'A "files" field with at least one file is required',
      );
    }
    for (const file of files) {
      assertFileSize(file);
    }
    return this.uploads.uploadFiles(files, resolveFolder(folder));
  }

  @Delete(':publicId')
  @UseGuards(AuthGuard)
  remove(@Param('publicId') publicId: string) {
    return this.uploads.deleteFile(publicId);
  }

  @Get('proxy/:publicId')
  @UseGuards(AuthGuard)
  async proxyMedia(
    @Param('publicId') publicId: string,
  ) {
    // Look up the resource via the service method
    const resource = await this.uploads.findResource(publicId)

    if (!resource) {
      throw new BadRequestException('Media not found')
    }

    // Determine resource type from the Cloudinary response
    const isVideo =
      resource.url?.includes('/video/upload/') ||
      resource.resourceType === 'video'

    // Transform the secure URL with download-prevention parameters
    // d_download_0 removes the download button from Cloudinary's viewer
    // q_auto optimizes quality, f_jpg ensures consistent format
    // w_800 limits display width for images, w_480 for videos
    let transformedUrl = resource.secureUrl ?? resource.url ?? ''

    if (isVideo) {
      transformedUrl = transformedUrl.replace(
        '/video/upload/',
        '/video/upload/d_download_0,q_auto,f_jpg/w_480,c_fill/',
      )
    } else if (transformedUrl.includes('/image/upload/')) {
      transformedUrl = transformedUrl.replace(
        '/image/upload/',
        '/image/upload/d_download_0,q_auto,f_jpg,w_800/',
      )
    }

    // Return the secure, transformed URL with metadata
    return {
      url: transformedUrl,
      publicId: resource.publicId,
      contentType: resource.format
        ? isVideo
          ? `video/${resource.format}`
          : `image/${resource.format}`
        : isVideo
          ? 'video/mp4'
          : 'image/jpeg',
      isVideo,
    }
  }
}
