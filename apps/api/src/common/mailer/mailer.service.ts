import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import mjml2html from 'mjml';
import Handlebars from 'handlebars';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/shared/config/config.types';
import { MailData } from '@/shared/interfaces/mail-data.interface';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly configService: ConfigService<AllConfigType>) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow('mail.host', { infer: true }),
      port: this.configService.getOrThrow('mail.port', { infer: true }),
      secure:
        this.configService.getOrThrow('mail.port', { infer: true }) === 465,
      requireTLS:
        this.configService.getOrThrow('mail.port', { infer: true }) === 587,
      auth: {
        user: this.configService.getOrThrow('mail.auth.user', {
          infer: true,
        }),
        pass: this.configService.getOrThrow('mail.auth.password', {
          infer: true,
        }),
      },
    });
  }

  /**
   * Sends an email with optional MJML template processing.
   */
  async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: MailData): Promise<void> {
    let html: string | undefined;

    try {
      if (templatePath) {
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        let compiledHtml = Handlebars.compile(templateContent)(context || {});
        if (templatePath.endsWith('.mjml')) {
          const mjmlOutput = mjml2html(compiledHtml);
          if (mjmlOutput.errors.length) {
            this.logger.error('❌ MJML Compilation Errors:', mjmlOutput.errors);
            throw new Error('MJML Template Compilation Failed');
          }
          compiledHtml = mjmlOutput.html;
        }
        html = compiledHtml;
      }
      await this.transporter.sendMail({
        ...mailOptions,
        from: mailOptions.from,
        html: mailOptions.html ?? html,
      });
      this.logger.log(`📩 Email sent to: ${mailOptions.to}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email: ${error.message}`,
        error.stack,
      );
      throw new Error('Email sending failed');
    }
  }
}
