import { AppConfig } from './app-config.types';
import { MailConfig, MailConfigStrict } from './mail/mail-config.type';
import { QueueConfig } from './queue/queue-config.types';

export type AllConfigType = {
  mail: MailConfig;
  mailStrict: MailConfigStrict;
  appConfig: AppConfig;
  queue: QueueConfig;
};
