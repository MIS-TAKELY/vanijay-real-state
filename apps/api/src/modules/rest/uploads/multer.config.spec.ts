import {
  ACCEPTED_ASSET_MIMETYPES,
  VIDEO_MIMETYPES,
  createMulterOptions,
} from './multer.config';

describe('multer.config', () => {
  it('accepts listing video mime types', () => {
    expect(ACCEPTED_ASSET_MIMETYPES).toEqual(
      expect.arrayContaining([...VIDEO_MIMETYPES]),
    );
  });

  it('lets mp4 through the file filter', () => {
    const options = createMulterOptions() as {
      fileFilter: (
        req: unknown,
        file: { mimetype: string },
        cb: (error: Error | null, accept: boolean) => void,
      ) => void;
    };

    const cb = jest.fn();
    options.fileFilter(null, { mimetype: 'video/mp4' }, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });
});
