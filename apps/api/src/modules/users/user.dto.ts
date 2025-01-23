import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDate,
  MinLength,
  MaxLength,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export class UserCreateDto {
  @ApiProperty({ description: 'The first name of the user', example: 'John' })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName: string;

  @ApiProperty({ description: 'The last name of the user', example: 'Doe' })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'The username for the user',
    example: 'john.doe',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9.]*$/, {
    message: 'Username can only contain lowercase letters, numbers, and dots.',
  })
  userName?: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'johndoe@example.com',
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  email: string;

  @ApiPropertyOptional({
    description: 'Whether the user is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the user is a super user',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isSuperUser?: boolean;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  @MinLength(10, {
    message: 'Phone number must be at least 10 characters long',
  })
  @MaxLength(15, { message: 'Phone number must not exceed 15 characters' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Gender of the user',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'], {
    message: 'Gender must be male, female, or other',
  })
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'Birth date of the user',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  birthDate?: Date;

  @ApiPropertyOptional({
    description: 'Address of the user',
    example: '123 Main St',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Address must not exceed 100 characters' })
  address?: string;

  @ApiProperty({
    description: 'The hashed password of the user',
    example: 'hashed_password123',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiPropertyOptional({
    description: 'The role of the user',
    example: UserRole.USER,
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be USER, ADMIN, or SUPER_ADMIN' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Role ID of the user',
    example: 'role_12345',
  })
  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'Role ID must be between 3 and 50 characters' })
  roleId?: string;

  @ApiProperty({ description: 'Who created the user', example: 'admin_user' })
  @IsString()
  @Length(3, 50, { message: 'Created by must be between 3 and 50 characters' })
  createdBy: string;

  @ApiProperty({
    description: 'Who last updated the user',
    example: 'admin_user',
  })
  @IsString()
  @Length(3, 50, { message: 'Updated by must be between 3 and 50 characters' })
  updatedBy: string;
}

export class UserUpdateDto extends PartialType(UserCreateDto) {
  // No constructor needed here as PartialType automatically handles it.
}
