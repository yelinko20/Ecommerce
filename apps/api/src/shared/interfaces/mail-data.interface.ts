import { SendMailOptions } from 'nodemailer';

export interface MailData extends SendMailOptions {
  templatePath?: string;
  context?: Record<string, unknown>;
}
