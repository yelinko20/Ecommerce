import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundException extends HttpException {
  constructor(message: string = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = 'Invalid request data') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class InternalServerException extends HttpException {
  constructor(message: string = 'Internal server error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
