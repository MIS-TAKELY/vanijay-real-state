import { NestFactory } from '@nestjs/core';
import { auth } from '@repo/auth';
import { toNodeHandler } from 'better-auth/node';
import 'dotenv/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const authHandler = toNodeHandler(auth);
  app.use('/api/auth', authHandler);

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
