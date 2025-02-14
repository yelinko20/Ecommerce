import { Body, Controller, Post } from '@nestjs/common';
import * as schema from '@/drizzle/schema/index';
import { UsersService } from './users.service';
import { UserCreateDto, UserUpdateDto } from './user.dto';
import { ControllerFactory } from '@/common/base/base.controller';
import { SecurityService } from '@/common/security/security.service';
import { ApiResponse } from '@/common/base/response-wrapper';
import { BadRequestException } from '@/common/exceptions/custom-exceptions';
import { MailService } from '@/common/mail/mail.service';
import { ApiTags } from '@nestjs/swagger';
import { MailerService } from '@/common/mailer/mailer.service';

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
    protected readonly mailerService: MailerService,
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
      await this.mailerService.sendMail({
        to: userData.email,
        subject: 'Welcome!',
        templatePath: 'templates/welcome.mjml',
        context: {
          firstName: 'John',
          confirmUrl: 'https://example.com/confirm',
        },
      });
    }

    return new ApiResponse(true, 'User Create Suucess fully', createdUser);
  }
}
