import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class MailQueue {
  constructor(@InjectQueue('mail') private readonly mailQueue: Queue) {}

  async addMailJob(priority: number = 1) {
    await this.mailQueue.add(
      'sendMail',
      {},
      {
        priority,
        delay: 5000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
      },
    );
  }
}
