import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import {
  DynamicModule,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import express from 'express';
import { QueueBoardMiddleware } from './queue-board.middleware';
import { AllConfigType } from '@/shared/config/config.types';
import { InjectMailQueue } from './decorators/inject-queue.decorator';
import { QueueModule } from '../queue/queue.module';
import { MAIL_QUEUE } from '@/shared/constants/queue-names';

@Module({
  imports: [ConfigModule, QueueModule],
})
export class QueueBoardModule implements NestModule, OnModuleInit {
  private serverAdapter = new ExpressAdapter();
  private readonly logger = new Logger(QueueBoardModule.name);
  static configService: ConfigService<AllConfigType>;

  constructor(@InjectMailQueue() private readonly mailQueue: Queue) {}

  queues = [new BullMQAdapter(this.mailQueue)];

  static register(): DynamicModule {
    return {
      module: QueueBoardModule,
      imports: [
        BullModule.forRootAsync({
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return {
              connection: {
                url: configService.getOrThrow('queue.url', { infer: true }),
                // host: configService.getOrThrow('queue.host', { infer: true }),
                // port: configService.getOrThrow('queue.port', { infer: true }),
              },
              defaultJobOptions: {
                removeOnComplete: 1000,
                removeOnFail: 5000,
                attempts: 3,
              },
            };
          },
          imports: [ConfigModule],
          inject: [ConfigService],
        }),
        BullModule.registerQueue({ name: MAIL_QUEUE }),
      ],
    };
  }

  onModuleInit() {
    this.serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: [...this.queues],
      serverAdapter: this.serverAdapter,
    });
    this.logger.log('🎯 Bull Board UI initialized at /queues');
  }

  configure(consumer: MiddlewareConsumer) {
    const app = express();
    app.use('/queues', this.serverAdapter.getRouter());
    consumer.apply(QueueBoardMiddleware, app).forRoutes('*');
    this.logger.log('🚀 Bull Board Express middleware applied successfully!');
  }
}
