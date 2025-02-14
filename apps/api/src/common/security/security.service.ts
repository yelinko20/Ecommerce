import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SecurityService {
  private readonly secretKey: string;
  private readonly algorithm: jwt.Algorithm;
  private readonly tokenExpiryMinutes: number;
  private readonly emailTokenExpiryMinutes: number;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.getOrThrow<string>('SECRET_KEY');
    this.algorithm = 'HS256';
    this.tokenExpiryMinutes = 60 * 24 * 8;
    this.emailTokenExpiryMinutes = 48;
  }

  createAccessToken(subject: string | any, expiresIn?: string): string {
    const expiry = expiresIn || `${this.tokenExpiryMinutes}m`;
    const payload = { sub: subject };
    return jwt.sign(payload, this.secretKey, {
      expiresIn: expiry,
      algorithm: this.algorithm,
    });
  }

  createRefreshToken(
    subject: string | any,
    refreshTokenExpiry: number = 7,
  ): string {
    const expiry = `${refreshTokenExpiry * 24 * 60}m`;
    return this.createAccessToken(subject, expiry);
  }

  async hashPassword(plainPassword: string): Promise<string> {
    return await argon2.hash(plainPassword);
  }

  async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, plainPassword);
  }

  generateCsrfToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  decodeToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey, {
        algorithms: [this.algorithm],
      });
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    const exp = payload?.exp;
    if (!exp) {
      throw new Error('Token does not contain an expiration time (exp).');
    }
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime > exp) {
      throw new Error('Token has expired.');
    }
    return false;
  }

  createEmailAccessToken(subject: string | any, expiresIn?: string): string {
    const expiry = expiresIn || `${this.emailTokenExpiryMinutes}m`;
    const payload = { sub: subject, type: 'email_verification' };
    return jwt.sign(payload, this.secretKey, {
      expiresIn: expiry,
      algorithm: this.algorithm,
    });
  }
}
