import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { MailData } from '@/shared/interfaces/mail-data.interface';
import { InjectMailQueue } from '../decorators/inject-queue.decorator';

@Injectable()
export class MailQueue {
  constructor(@InjectMailQueue() private readonly mailQueue: Queue) {}

  async addMailJob(mailData: MailData, priority: number = 1) {
    await this.mailQueue.add('sendMail', mailData, { priority });
  }
}
