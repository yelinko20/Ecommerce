import { OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

export abstract class WorkerHostProcessor extends WorkerHost {
  protected readonly logger = new Logger(WorkerHostProcessor.name);

  @OnWorkerEvent('active')
  async onActive(job: Job) {
    const { id, name, queueName, attemptsMade, timestamp, opts } = job;
    const startTime = timestamp ? new Date(timestamp).toISOString() : '';
    this.logger.log(
      `[🔥 START] Job [${id}] (${name}) started in queue [${queueName}] on ${startTime}. Attempt: ${attemptsMade + 1}/${opts.attempts || 1}`,
    );
  }

  @OnWorkerEvent('progress')
  async onProgress(job: Job) {
    const { id, name, progress } = job;
    this.logger.log(
      `[📊 PROGRESS] Job [${id}] (${name}) is ${progress}% complete.`,
    );
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    const { id, name, queueName, finishedOn, returnvalue, timestamp } = job;
    const completionTime = finishedOn ? new Date(finishedOn).toISOString() : '';
    const startTime = timestamp ? new Date(timestamp).toISOString() : '';

    const executionTime =
      finishedOn && timestamp
        ? `${(finishedOn - timestamp) / 1000}s`
        : 'Unknown';

    this.logger.log(
      `[✅ SUCCESS] Job [${id}] (${name}) completed in queue [${queueName}] at ${completionTime}. Execution Time: ${executionTime}. Result: ${JSON.stringify(returnvalue)}`,
    );
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, err: Error) {
    const { id, name, queueName, failedReason, attemptsMade, opts } = job;
    const maxAttempts = opts.attempts || 1;

    this.logger.error(
      `[❌ FAILED] Job [${id}] (${name}) failed in queue [${queueName}]. Attempt: ${attemptsMade}/${maxAttempts}. Reason: ${failedReason}`,
    );

    this.logger.error(`Stack Trace: ${err.stack}`);

    if (attemptsMade >= maxAttempts) {
      this.logger.warn(
        `[⚠️ FINAL FAILURE] Job [${id}] (${name}) has exceeded max retries.`,
      );
    }
  }

  @OnWorkerEvent('stalled')
  async onStalled(job: Job) {
    const { id, name, queueName } = job;
    this.logger.warn(
      `[⏳ STALLED] Job [${id}] (${name}) stalled in queue [${queueName}]. Retrying...`,
    );
  }

  @OnWorkerEvent('drained')
  async onDrained() {
    this.logger.log(
      `[🗑️ QUEUE EMPTY] All jobs in the queue have been processed.`,
    );
  }
}
