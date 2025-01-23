import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DrizzleModule } from '@/drizzle/drizzle.module';
import { SecurityModule } from '@/security/security.module';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [DrizzleModule, SecurityModule],
})
export class UsersModule {}
