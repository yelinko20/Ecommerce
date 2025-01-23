import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BaseModule } from './common/base/base.module';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import { SecurityModule } from './common/security/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    BaseModule,
    DrizzleModule,
    SecurityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
