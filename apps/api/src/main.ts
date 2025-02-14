import { NestFactory } from '@nestjs/core';
import {
  NestApplicationOptions,
  ValidationPipe,
  VersioningType,
  Logger,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { AppModule } from './app.module';
import { AllConfigType } from '@/shared/config/config.types';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@bull-board/express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // 🛠 App options with bufferLogs for better startup logging
    const appOptions: NestApplicationOptions = {
      cors: { origin: '*', methods: 'GET,HEAD,PUT,PATCH,POST,DELETE' },
      bufferLogs: true,
    };

    // 🚀 Create NestJS app
    const app = await NestFactory.create(AppModule, appOptions);
    const configService = app.get(ConfigService<AllConfigType>);

    // 🛡️ Security Middlewares
    app.use(helmet());

    // Optional: Rate limiter to prevent abuse
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
      }),
    );

    // 🏗️ Global Pipes (Validations)
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: false,
      }),
    );

    // 🌎 API Global Prefix
    const apiPrefix = configService.getOrThrow<string>('app.apiPrefix', {
      infer: true,
    });
    app.setGlobalPrefix(apiPrefix, { exclude: ['/'] });

    // 📌 Enable API Versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // 📄 Swagger API Documentation
    const swaggerConfig = new DocumentBuilder()
      .setTitle('E-commerce API')
      .setDescription('RESTful API for E-commerce platform')
      .setVersion('1.0')
      .addTag('e-commerce')
      // .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    // Enable shutdown hooks for graceful shutdown
    app.enableShutdownHooks();

    // 🚀 Start Server
    const port = configService.getOrThrow<number>('app.port', { infer: true });
    await app.listen(port);

    logger.log(`🚀 Server running on http://localhost:${port}`);
    logger.log(`📄 Swagger docs available at http://localhost:${port}/docs`);

    // 🛑 Graceful Shutdown Handling
    process.on('SIGINT', async () => {
      logger.warn('SIGINT received, shutting down...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.warn('SIGTERM received, shutting down...');
      await app.close();
      process.exit(0);
    });
  } catch (error) {
    Logger.error('❌ Error during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
