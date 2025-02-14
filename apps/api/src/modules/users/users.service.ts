import { Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@/drizzle/schema/index';
import { DATABASE_CONNECTION } from '@/drizzle/database-connection';
import { UserCreateDto, UserUpdateDto } from './user.dto';
import { BaseService } from '@/common/base/base.service';

@Injectable()
export class UsersService extends BaseService<
  typeof schema.User,
  UserCreateDto,
  UserUpdateDto
> {
  constructor(@Inject(DATABASE_CONNECTION) db: NodePgDatabase<typeof schema>) {
    super(db, schema.User);
  }

  generateUserName(firstName: string, lastName: string): string {
    const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    return baseUsername.replace(/[^a-z0-9.]/g, '');
  }

  modifyUserNameWithSuffix(baseUsername: string, counter: number): string {
    return `${baseUsername}_${counter}`;
  }

  async handleUserSuggestedName(suggestedName: string): Promise<string> {
    let userName = suggestedName;
    let counter = 1;

    while (await this.alreadyExisted({ userName })) {
      userName = this.modifyUserNameWithSuffix(suggestedName, counter);
      counter++;
    }

    return userName;
  }
}
