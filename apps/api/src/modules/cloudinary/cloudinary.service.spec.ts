import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough } from 'stream';
import { CLOUDINARY } from './cloudinary.constants';
import { CloudinaryService } from './cloudinary.service';

function uploadStreamMock(
  handler: (error: Error | null, result?: unknown) => void,
) {
  const stream = new PassThrough();
  // Immediately complete as if Cloudinary processed the buffer synchronously.
  setImmediate(() => handler(null, mockedUploadResponse()));
  return stream;
}

const mockedUploadResponse = () => ({
  public_id: 'properties/abc123',
  url: 'http://res.cloudinary.com/cloud/image/upload/v1/properties/abc123.jpg',
  secure_url:
    'https://res.cloudinary.com/cloud/image/upload/v1/properties/abc123.jpg',
  format: 'jpg',
  resource_type: 'image',
  bytes: 1024,
  width: 800,
  height: 600,
  original_filename: 'photo.jpg',
});

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let client: {
    uploader: { upload_stream: jest.Mock };
    api: { delete_resources: jest.Mock; resource: jest.Mock };
  };

  beforeEach(async () => {
    client = {
      uploader: {
        upload_stream: jest
          .fn()
          .mockImplementation(
            (
              _options,
              handler: (error: Error | null, result?: unknown) => void,
            ) => uploadStreamMock(handler),
          ),
      },
      api: {
        delete_resources: jest.fn().mockResolvedValue({ deleted: ['abc'] }),
        resource: jest
          .fn()
          .mockRejectedValue({ http_code: 404, message: 'Not Found' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService, { provide: CLOUDINARY, useValue: client }],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('uploads a buffer and returns normalized metadata', async () => {
    const result = await service.uploadBuffer(Buffer.from('data'), {
      folder: 'properties',
      tags: 'listing',
    });

    expect(client.uploader.upload_stream).toHaveBeenCalledWith(
      expect.objectContaining({
        folder: 'properties',
        tags: 'listing',
        resource_type: 'auto',
      }),
      expect.any(Function),
    );
    expect(result).toMatchObject({
      publicId: 'properties/abc123',
      secureUrl:
        'https://res.cloudinary.com/cloud/image/upload/v1/properties/abc123.jpg',
      format: 'jpg',
    });
  });

  it('rejects when the upload stream reports an error', async () => {
    client.uploader.upload_stream.mockImplementation(
      (_options, handler: (error: Error | null) => void) => {
        setImmediate(() => handler(new Error('boom')));
        return new PassThrough();
      },
    );

    await expect(service.uploadBuffer(Buffer.from('data'))).rejects.toThrow(
      'boom',
    );
  });

  it('deletes a resource and reports ok once it is gone', async () => {
    client.api.resource.mockRejectedValue({ http_code: 404 });
    const result = await service.delete('properties/abc123');

    expect(client.api.delete_resources).toHaveBeenCalledWith(
      ['properties/abc123'],
      { type: 'upload', resource_type: 'image' },
    );
    expect(result).toEqual({ result: 'ok' });
  });
});
