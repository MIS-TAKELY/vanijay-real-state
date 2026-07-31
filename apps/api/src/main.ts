import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { auth } from '@repo/auth';
import { toNodeHandler } from 'better-auth/node';
import 'dotenv/config';
import * as express from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

// Note: the global ValidationPipe and GlobalExceptionFilter are registered
// through APP_PIPE / APP_FILTER in CommonModule (Nest DI context), so they also
// apply to the testing module automatically. Do not re-add useGlobalPipes here
// (it would duplicate validation and bypass DI in tests).

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    // Buffer Nest's early boot logs and re-emit them through nestjs-pino below.
    bufferLogs: true,
  });
    // Structured JSON logging (stdout) for app logs; the pino-http request logger
  // is installed by LoggerModule during app.init(). `Logger` (not the
  // request-scoped `PinoLogger`) is the sync app-level logger that Nest's
  // own `Logger` class delegates to.
  app.useLogger(app.get(Logger));

  
  app.enableCors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
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

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
