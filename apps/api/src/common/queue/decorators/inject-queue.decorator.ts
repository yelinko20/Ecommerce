import { InjectQueue } from '@nestjs/bullmq';
import { MAIL_QUEUE } from '@/shared/constants/queue-names';

export const InjectMailQueue = () => InjectQueue(MAIL_QUEUE);
