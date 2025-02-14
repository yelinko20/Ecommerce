import { Inject, Injectable } from '@nestjs/common';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { MODULE_OPTIONS_TOKEN } from './queue-board.module-definition';
import { QueueBoardModuleOptions } from './queue-board.interface';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/shared/config/config.types';

@Injectable()
export class QueueBoardService {
  private adapters: BullMQAdapter[];

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: QueueBoardModuleOptions,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.adapters = this.options.queues.map((name) => {
      return new BullMQAdapter(
        new Queue(name, {
          connection: {
            url: this.configService.getOrThrow('queue.url', { infer: true }),
            // host: this.configService.getOrThrow('queue.host', { infer: true }),
            // port: this.configService.getOrThrow('queue.port', { infer: true }),
          },
        }),
      );
    });
  }

  getAdapters() {
    return this.adapters;
  }
}
