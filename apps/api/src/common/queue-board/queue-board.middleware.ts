import * as argon2 from 'argon2';
import { NextFunction, Request, Response } from 'express';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueueBoardMiddleware implements NestMiddleware {
  private readonly username: string;
  private readonly passwordHash: string;

  constructor(private readonly configService: ConfigService) {
    this.username = this.configService.get<string>('BULL_BOARD_USERNAME') || '';
    this.passwordHash =
      this.configService.get<string>('BULL_BOARD_PASSWORD_HASH') || '';
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.get('authorization');

    if (!authHeader?.startsWith('Basic ')) {
      this.sendUnauthorizedResponse(res);
      return;
    }

    const encodedCreds = authHeader.split(' ')[1];
    const decodedCreds = Buffer.from(encodedCreds, 'base64').toString('utf-8');
    const [username, password] = decodedCreds.split(':');

    if (!this.username || !this.passwordHash || username !== this.username) {
      this.sendUnauthorizedResponse(res);
      return;
    }

    try {
      const isPasswordValid = await argon2.verify(this.passwordHash, password);

      if (!isPasswordValid) {
        this.sendUnauthorizedResponse(res);
        return;
      }
    } catch (error) {
      console.error('Error verifying password:', error);
      this.sendUnauthorizedResponse(res);
      return;
    }

    next();
  }

  private sendUnauthorizedResponse(res: Response): void {
    res.setHeader(
      'WWW-Authenticate',
      'Basic realm="Restricted Area", charset="UTF-8"',
    );
    res.sendStatus(401);
  }
}
