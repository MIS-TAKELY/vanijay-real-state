import {
  BadRequestException,
  Controller,
  Delete,
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
  UploadedFile as UploadedFileType,
} from './multer.config';
import { UploadFolder, UploadsService } from './uploads.service';

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

@Controller('api/v1/uploads')
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', createMulterOptions()))
  uploadSingle(
    @UploadedFile() file: UploadedFileType | undefined,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('A "file" field is required');
    }
    return this.uploads.uploadFile(file, resolveFolder(folder));
  }

  @Post('multiple')
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor('files', 20, createMulterOptions()))
  uploadMultiple(
    @UploadedFiles() files: UploadedFileType[] | undefined,
    @Query('folder') folder?: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'A "files" field with at least one file is required',
      );
    }
    return this.uploads.uploadFiles(files, resolveFolder(folder));
  }

  @Delete(':publicId')
  @UseGuards(AuthGuard)
  remove(@Param('publicId') publicId: string) {
    return this.uploads.deleteFile(publicId);
  }
}
