import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { SecurityModule } from '@/common/security/security.module';
import { MailModule } from '@/common/mail/mail.module';
import { MailerModule } from '@/common/mailer/mailer.module';
import { CacheModule } from '@nestjs/cache-manager';
import { QueueModule } from '@/common/queue/queue.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [
    DrizzleModule,
    SecurityModule,
    MailModule,
    MailerModule,
    CacheModule.register(),
    QueueModule,
  ],
})
export class UsersModule {}
