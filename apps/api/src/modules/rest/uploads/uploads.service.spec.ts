import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { UploadsService } from './uploads.service';

describe('UploadsService', () => {
  let service: UploadsService;
  const cloudinary = {
    uploadBuffer: jest.fn(),
    uploadMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        { provide: CloudinaryService, useValue: cloudinary },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uploads a single file into the requested folder', async () => {
    cloudinary.uploadBuffer.mockResolvedValue({ publicId: 'properties/x' });

    const result = await service.uploadFile(
      { buffer: Buffer.from('a'), originalname: 'a.jpg' },
      'properties',
    );

    expect(cloudinary.uploadBuffer).toHaveBeenCalledWith(
      Buffer.from('a'),
      expect.objectContaining({ folder: 'properties' }),
    );
    expect(result).toEqual({ publicId: 'properties/x' });
  });

  it('delegates deletion to cloudinary', async () => {
    cloudinary.delete.mockResolvedValue({ result: 'ok' });
    await service.deleteFile('properties/x');
    expect(cloudinary.delete).toHaveBeenCalledWith('properties/x');
  });
});
