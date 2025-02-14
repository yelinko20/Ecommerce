import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/modules/auth/auth.module';

import { UsersModule } from '@/modules/users/users.module';
import { BaseModule } from '@/common/base/base.module';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { SecurityModule } from '@/common/security/security.module';
import { MailModule } from '@/common/mail/mail.module';
import { MailerModule } from '@/common/mailer/mailer.module';
import { QueueModule } from '@/common/queue/queue.module';
import mailConfig from '@/shared/config/mail/mail.config';
import appConfig from '@/shared/config/app.config';
import queueConfig from '@/shared/config/queue/queue.config';
import { QueueBoardModule } from './common/queue-board/queue-board.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mailConfig, appConfig, queueConfig],
      envFilePath: ['.env'],
    }),
    AuthModule,
    UsersModule,
    BaseModule,
    DrizzleModule,
    SecurityModule,
    MailModule,
    MailerModule,
    QueueModule,
    QueueBoardModule.register(),
    CacheModule.register(),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
