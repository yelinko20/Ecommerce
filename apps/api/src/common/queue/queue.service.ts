import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
}
