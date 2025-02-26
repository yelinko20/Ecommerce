import { Body, Controller, Post } from '@nestjs/common';
import * as schema from '@/drizzle/schema/index';
import { UsersService } from './users.service';
import { UserCreateDto, UserUpdateDto } from './user.dto';
import { ControllerFactory } from '@/common/base/base.controller';
import { SecurityService } from '@/common/security/security.service';
import { ApiResponse } from '@/common/base/response-wrapper';
import { BadRequestException } from '@/common/exceptions/custom-exceptions';
import { ApiTags } from '@nestjs/swagger';
import { MailQueue } from '@/common/queue/mail/mail.queue';

@ApiTags('User')
@Controller('users')
export class UsersController extends ControllerFactory<
  typeof schema.User,
  UserCreateDto,
  UserUpdateDto
>(UserCreateDto, UserUpdateDto) {
  constructor(
    protected readonly userService: UsersService,
    protected readonly securityService: SecurityService,
    protected readonly mailQueue: MailQueue,
  ) {
    super(userService);
  }

  @Post()
  async create(
    @Body() userCreateDto: UserCreateDto,
  ): Promise<ApiResponse<typeof schema.User>> {
    const { firstName, lastName, userName, password, email } = userCreateDto;

    const isEmailExisted = await this.userService.alreadyExisted({ email });

    if (isEmailExisted) {
      throw new BadRequestException(`${email} with user is already existed`);
    }

    let username: string;

    if (userName) {
      username = await this.userService.handleUserSuggestedName(
        userName.toLowerCase(),
      );
    } else {
      const baseUsername = this.userService.generateUserName(
        firstName,
        lastName,
      );
      username = await this.userService.handleUserSuggestedName(baseUsername);
    }

    const hashedPassword = await this.securityService.hashPassword(password);

    const userData = {
      ...userCreateDto,
      userName: username,
      hashedPassword,
    };
    const createdUser = await this.userService.create(userData);
    if (createdUser) {
      function delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      const testUsers = Array.from({ length: 100 }, (_, i) => ({
        email: `testuser${i + 1}@example.com`,
        firstName: `User${i + 1}`,
        confirmUrl: `https://example.com/confirm/${i + 1}`,
      }));

      for (const user of testUsers) {
        await this.mailQueue.addMailJob({
          to: user.email,
          subject: 'Welcome!',
          templatePath: 'templates/welcome.mjml',
          context: {
            firstName: user.firstName,
            confirmUrl: user.confirmUrl,
          },
        });
        delay(1000);
      }
    }

    return new ApiResponse(true, 'User Create Success fully', createdUser);
  }
}
