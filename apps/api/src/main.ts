import { NestFactory } from '@nestjs/core';
import { auth } from '@repo/auth';
import { toNodeHandler } from 'better-auth/node';
import 'dotenv/config';
import * as express from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  // Build the list of allowed CORS origins from env vars so every
  // front-end app (client + admin) can talk to the API.
  // You can also override the whole list with ALLOWED_ORIGINS (comma-separated).
  const corsOrigins =
    process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean) ??
    [
      process.env.CLIENT_URL ?? 'https://realstate.vanijay.com',
      process.env.ADMIN_URL,
    ].filter(Boolean);

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // better auth needs raw req to check the hash
  const authHandler = toNodeHandler(auth);
  app.use('/api/auth', authHandler);

  // graphql and rest need req.body to be parsed to check the body content if not done so it will show error like body missing
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
