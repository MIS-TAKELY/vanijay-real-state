import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { auth } from '@repo/auth';
import { toNodeHandler } from 'better-auth/node';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const authHandler = toNodeHandler(auth);
  app.use('/api/auth', authHandler);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
