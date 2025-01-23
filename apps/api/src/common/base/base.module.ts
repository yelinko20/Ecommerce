import { Module } from '@nestjs/common';
// import { BaseController } from './base.controller';
import { BaseService } from './base.service';
import { DrizzleModule } from '@/drizzle/drizzle.module';

@Module({
  providers: [BaseService],
  controllers: [],
  imports: [DrizzleModule],
})
export class BaseModule {}
