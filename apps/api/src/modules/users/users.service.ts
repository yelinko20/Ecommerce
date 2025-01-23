import { BaseService } from '@/base/base.service';
import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/drizzle/schema/index';
import { DATABASE_CONNECTION } from '@/drizzle/database-connection';
import { UserCreateDto, UserUpdateDto } from './user.dto';

@Injectable()
export class UsersService extends BaseService<
  typeof schema.User,
  UserCreateDto,
  UserUpdateDto
> {
  constructor(@Inject(DATABASE_CONNECTION) db: NodePgDatabase<typeof schema>) {
    super(db, schema.User);
  }
}
