import { Global, Module, OnModuleInit } from '@nestjs/common';
import { Inject, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.constants';
import { CloudinaryService } from './cloudinary.service';

@Global()
@Module({
  providers: [
    {
      provide: CLOUDINARY,
      useFactory: () => {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
          throw new Error(
            'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, ' +
              'CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your environment.',
          );
        }

        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true,
        });

        return cloudinary;
      },
    },
    CloudinaryService,
  ],
  exports: [CloudinaryService, CLOUDINARY],
})
export class CloudinaryModule implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryModule.name);

  constructor(@Inject(CLOUDINARY) private readonly client: typeof cloudinary) {}

  onModuleInit(): void {
    const config = this.client.config();
    this.logger.log(
      `Cloudinary configured for cloud "${config.cloud_name ?? 'unknown'}"`,
    );
  }
}
