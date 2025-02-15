import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/shared/config/config.types';
import { MAIL_QUEUE } from '@/shared/constants/queue-names';
import { MailerModule } from '../mailer/mailer.module';
import { MailQueue } from './mail/mail.queue';
import { MailProcessor } from './mail/mail.processor';

@Module({
  imports: [
    ConfigModule,
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
    BullModule.registerQueue({
      name: MAIL_QUEUE,
    }),
    MailerModule,
  ],
  providers: [QueueService, MailProcessor, MailQueue],
  controllers: [QueueController],
  exports: [QueueModule, MailQueue],
})
export class QueueModule {}
