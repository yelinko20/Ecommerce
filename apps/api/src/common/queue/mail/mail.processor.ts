import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailerService } from '@/common/mailer/mailer.service';
import { MailData } from '@/shared/interfaces/mail-data.interface';
import { MAIL_QUEUE } from '@/shared/constants/queue-names';
import { WorkerHostProcessor } from '../processor/worker-host.processor';

@Processor(MAIL_QUEUE, { concurrency: 10 })
export class MailProcessor extends WorkerHostProcessor {
  protected readonly logger = new Logger(MailProcessor.name);
  constructor(private readonly mailerService: MailerService) {
    super();
  }
  async process(job: Job<MailData>) {
    this.logger.log(`📨 Processing email job: ${job.id}`);

    try {
      await this.mailerService.sendMail(job.data);
      this.logger.log(`✅ Email sent successfully for job: ${job.id}`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to send email: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
