import { ControllerFactory } from '@/base/base.controller';
import { Body, Controller, Post } from '@nestjs/common';
import * as schema from '@/drizzle/schema/index';
import { UsersService } from './users.service';
import { UserCreateDto, UserUpdateDto } from './user.dto';
import { ApiResponse } from '@/base/response-wrapper';
import { SecurityService } from '@/security/security.service';
import { BadRequestException } from '@/exceptions/custom-exceptions';

@Controller('users')
export class UsersController extends ControllerFactory<
  typeof schema.User,
  UserCreateDto,
  UserUpdateDto
>(UserCreateDto, UserUpdateDto) {
  constructor(
    protected readonly userService: UsersService,
    protected readonly securityService: SecurityService,
  ) {
    super(userService);
  }

  @Post()
  async create(
    @Body() userCreateDto: UserCreateDto,
  ): Promise<ApiResponse<typeof schema.User>> {
    try {
      const { firstName, lastName, userName, password, email } = userCreateDto;

      const isEmailExisted = await this.userService.alreadyExisted({ email });

      if (isEmailExisted) {
        throw new BadRequestException(`${email} with user is already existed`);
      }

      let username: string;

      if (userName) {
        username = await this.handleUserSuggestedName(userName.toLowerCase());
      } else {
        const baseUsername = this.generateUserName(firstName, lastName);
        username = await this.handleUserSuggestedName(baseUsername);
      }

      const hashedPassword = await this.securityService.hashPassword(password);

      const userData = {
        ...userCreateDto,
        userName: username,
        hashedPassword,
      };
      const createdUser = await this.userService.create(userData);

      return new ApiResponse(true, 'User Create Suucess fully', createdUser);
    } catch (error) {
      throw new Error(`User creation failed: ${error.message}`);
    }
  }

  private generateUserName(firstName: string, lastName: string): string {
    const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    return baseUsername.replace(/[^a-z0-9.]/g, ''); // Remove invalid characters
  }

  private modifyUserNameWithSuffix(
    baseUsername: string,
    counter: number,
  ): string {
    return `${baseUsername}_${counter}`;
  }

  private async handleUserSuggestedName(
    suggestedName: string,
  ): Promise<string> {
    let userName = suggestedName;
    let counter = 1;

    while (await this.userService.alreadyExisted({ userName })) {
      userName = this.modifyUserNameWithSuffix(suggestedName, counter);
      counter++;
    }

    return userName;
  }
}
