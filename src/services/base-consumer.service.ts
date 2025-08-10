import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload, KafkaMessage } from 'kafkajs';
import { KafkaConsumerConfig } from '../config/kafka.config';

export interface MessageHandler<T = any> {
  (message: T, payload: EachMessagePayload): Promise<void>;
}

export interface ConsumerHealth {
  isConnected: boolean;
  isRunning: boolean;
  lastMessageTime?: Date;
  messageCount: number;
  errorCount: number;
  lastError?: Error;
}

@Injectable()
export abstract class BaseConsumerService implements OnModuleInit, OnModuleDestroy {
  protected readonly logger = new Logger(this.constructor.name);
  protected kafka: Kafka;
  protected consumer: Consumer;
  protected config: KafkaConsumerConfig;
  protected isRunning = false;
  protected isConnected = false;
  protected messageCount = 0;
  protected errorCount = 0;
  protected lastMessageTime?: Date;
  protected lastError?: Error;
  protected shutdownSignal = false;

  constructor(config: KafkaConsumerConfig) {
    this.config = config;
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      connectionTimeout: 3000,
      authenticationTimeout: 1000,
      reauthenticationThreshold: 10000,
      requestTimeout: 30000,
      enforceRequestTimeout: true,
      retry: {
        initialRetryTime: 100,
        retries: 8,
        factor: 0.8,
        maxRetryTime: 30000,
      },
    });
  }

  async onModuleInit() {
    await this.connect();
    await this.startConsuming();
  }

  async onModuleDestroy() {
    await this.gracefulShutdown();
  }

  protected async connect(): Promise<void> {
    try {
      this.consumer = this.kafka.consumer({
        groupId: this.config.groupId,
        sessionTimeout: this.config.sessionTimeout,
        heartbeatInterval: this.config.heartbeatInterval,
        rebalanceTimeout: this.config.rebalanceTimeout,
        maxBytesPerPartition: this.config.maxBytesPerPartition,
        minBytes: this.config.minBytes,
        maxBytes: this.config.maxBytes,
      });

      await this.consumer.connect();
      this.isConnected = true;
      this.logger.log(`Consumer connected for topic: ${this.config.topic}`);
    } catch (error) {
      this.logger.error(`Failed to connect consumer for topic ${this.config.topic}:`, error);
      throw error;
    }
  }

  protected async startConsuming(): Promise<void> {
    try {
      await this.consumer.subscribe({
        topic: this.config.topic,
        fromBeginning: false,
      });

      this.logger.log(`Subscribed to topic: ${this.config.topic}`);

      await this.consumer.run({
        autoCommit: this.config.autoCommit,
        autoCommitInterval: this.config.autoCommitInterval,
        autoCommitThreshold: this.config.autoCommitThreshold,
        partitionsConsumedConcurrently: 1,
        eachMessage: async (payload) => {
          await this.handleMessage(payload);
        },
      });

      this.isRunning = true;
      this.logger.log(`Started consuming from topic: ${this.config.topic}`);
    } catch (error) {
      this.logger.error(`Failed to start consuming from topic ${this.config.topic}:`, error);
      throw error;
    }
  }

  protected async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;
    
    try {
      this.logger.debug(
        `Processing message - Topic: ${topic}, Partition: ${partition}, Offset: ${message.offset}`
      );
      console.log(message,"message")

      // Update metrics
      this.messageCount++;
      this.lastMessageTime = new Date();

      // Process the message
      await this.processMessage(message, payload);

      this.logger.debug(
        `Successfully processed message - Topic: ${topic}, Partition: ${partition}, Offset: ${message.offset}`
      );
    } catch (error) {
      this.errorCount++;
      this.lastError = error as Error;
      
      this.logger.error(
        `Error processing message - Topic: ${topic}, Partition: ${partition}, Offset: ${message.offset}`,
        error
      );

      // Implement retry logic for transient errors
      await this.handleMessageError(error, payload);
    }
  }

  protected async handleMessageError(error: any, payload: EachMessagePayload): Promise<void> {
    // Check if it's a retryable error
    if (this.isRetryableError(error)) {
      await this.retryMessage(payload);
    } else {
      // For non-retryable errors, log and continue
      this.logger.error('Non-retryable error encountered, skipping message', error);
    }
  }

  protected isRetryableError(error: any): boolean {
    // Define retryable error types
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'NetworkError',
      'TimeoutError',
    ];

    return retryableErrors.some(errorType => 
      error.message?.includes(errorType) || error.code === errorType
    );
  }

  protected async retryMessage(payload: EachMessagePayload, attempt = 1): Promise<void> {
    const maxRetries = this.config.retry.retries;
    const delay = this.config.retry.initialRetryTime * Math.pow(2, attempt - 1);

    if (attempt > maxRetries) {
      this.logger.error(
        `Max retries exceeded for message - Topic: ${payload.topic}, Partition: ${payload.partition}, Offset: ${payload.message.offset}`
      );
      return;
    }

    this.logger.warn(
      `Retrying message processing (attempt ${attempt}/${maxRetries}) - Topic: ${payload.topic}, Partition: ${payload.partition}, Offset: ${payload.message.offset}`
    );

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      await this.processMessage(payload.message, payload);
      this.logger.log(
        `Successfully processed message on retry - Topic: ${payload.topic}, Partition: ${payload.partition}, Offset: ${payload.message.offset}`
      );
    } catch (error) {
      await this.retryMessage(payload, attempt + 1);
    }
  }

  protected abstract processMessage(message: KafkaMessage, payload: EachMessagePayload): Promise<void>;

  protected async gracefulShutdown(): Promise<void> {
    this.shutdownSignal = true;
    
    try {
      if (this.consumer && this.isConnected) {
        this.logger.log('Disconnecting consumer...');
        await this.consumer.disconnect();
        this.isConnected = false;
        this.isRunning = false;
        this.logger.log('Consumer disconnected successfully');
      }
    } catch (error) {
      this.logger.error('Error during consumer shutdown:', error);
    }
  }

  public getHealth(): ConsumerHealth {
    return {
      isConnected: this.isConnected,
      isRunning: this.isRunning,
      lastMessageTime: this.lastMessageTime,
      messageCount: this.messageCount,
      errorCount: this.errorCount,
      lastError: this.lastError,
    };
  }

  public getConfig(): KafkaConsumerConfig {
    return this.config;
  }

  public async pause(): Promise<void> {
    if (this.consumer && this.isRunning) {
      await this.consumer.pause([{ topic: this.config.topic }]);
      this.isRunning = false;
      this.logger.log(`Paused consumer for topic: ${this.config.topic}`);
    }
  }

  public async resume(): Promise<void> {
    if (this.consumer && !this.isRunning) {
      await this.consumer.resume([{ topic: this.config.topic }]);
      this.isRunning = true;
      this.logger.log(`Resumed consumer for topic: ${this.config.topic}`);
    }
  }
} 