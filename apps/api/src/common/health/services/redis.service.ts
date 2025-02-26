import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private $client: RedisClientType;
  private isConnected = false;
  private reconnectAttempts = 0;

  constructor(private readonly configService: ConfigService) {
    this.$client = createClient({
      url: this.configService.getOrThrow('REDIS_URL'),
    });

    this.$client.on('error', (err) => {
      this.logger.error(`❌ Redis Error: ${err.message}`);
      this.scheduleReconnect();
    });

    this.$client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('✅ Connected to Redis.');
    });

    this.$client.on('end', () => {
      this.isConnected = false;
      this.logger.warn('⚠️ Redis connection closed.');
    });
  }

  async onModuleInit() {
    try {
      await this.$client.connect();
      this.logger.log('🚀 Redis connection established.');
    } catch (error) {
      this.logger.error(`❌ Initial Redis connection failed: ${error.message}`);
      this.scheduleReconnect();
    }
  }

  async ping(): Promise<string> {
    if (!this.isConnected) {
      throw new Error('Redis is not connected.');
    }
    return this.$client.ping();
  }

  async checkHealth(): Promise<{ status: string; latency?: number }> {
    const start = performance.now();
    try {
      await this.ping();
      const latency = (performance.now() - start).toFixed(2);
      return { status: 'up', latency: Number(latency) };
    } catch (error) {
      return { status: 'down' };
    }
  }

  private async scheduleReconnect() {
    if (this.isConnected) return;

    this.reconnectAttempts++;
    const delay = Math.min(2 ** this.reconnectAttempts * 1000, 30000);

    this.logger.warn(
      `🔄 Reconnecting to Redis in ${delay / 1000}s... (Attempt ${this.reconnectAttempts})`,
    );
    setTimeout(() => this.reconnect(), delay);
  }

  private async reconnect() {
    try {
      await this.$client.connect();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.logger.log('✅ Redis successfully reconnected.');
    } catch (error) {
      this.logger.error(`❌ Redis reconnection failed: ${error.message}`);
      this.scheduleReconnect();
    }
  }

  async onModuleDestroy() {
    try {
      await this.$client.quit();
      this.logger.log('🔌 Redis connection closed gracefully.');
    } catch (error) {
      this.logger.error(`❌ Error closing Redis connection: ${error.message}`);
    }
  }
}
