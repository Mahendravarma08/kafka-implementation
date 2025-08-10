import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { BaseConsumerService, ConsumerHealth } from './base-consumer.service';
import { OrdersConsumerService } from './orders-consumer.service';
import { NotificationConsumerService } from './notification-consumer.service';

export interface ConsumerManagerHealth {
  totalConsumers: number;
  activeConsumers: number;
  consumers: Record<string, ConsumerHealth>;
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
}

@Injectable()
export class ConsumerManagerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsumerManagerService.name);
  private consumers: Map<string, BaseConsumerService> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(
    private readonly ordersConsumer: OrdersConsumerService,
    private readonly notificationConsumer: NotificationConsumerService
  ) {}

  async onModuleInit() {
    // Register consumers
    this.registerConsumer('orders', this.ordersConsumer);
    this.registerConsumer('notification', this.notificationConsumer);
    
    // Start health monitoring
    this.startHealthMonitoring();
    
    this.logger.log('Consumer manager initialized successfully');
  }

  async onModuleDestroy() {
    // Stop health monitoring
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Gracefully shutdown all consumers
    await this.shutdownAllConsumers();
    
    this.logger.log('Consumer manager shutdown completed');
  }

  private registerConsumer(name: string, consumer: BaseConsumerService): void {
    this.consumers.set(name, consumer);
    this.logger.log(`Registered consumer: ${name}`);
  }

  private startHealthMonitoring(): void {
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);
  }

  private async performHealthCheck(): Promise<void> {
    const health = this.getHealth();
    
    if (health.overallHealth === 'unhealthy') {
      this.logger.error('Consumer health check failed:', health);
      
      // Attempt to restart unhealthy consumers
      await this.restartUnhealthyConsumers();
    } else if (health.overallHealth === 'degraded') {
      this.logger.warn('Consumer health check shows degraded state:', health);
    } else {
      this.logger.debug('Consumer health check passed');
    }
  }

  private async restartUnhealthyConsumers(): Promise<void> {
    for (const [name, consumer] of this.consumers.entries()) {
      const health = consumer.getHealth();
      
      if (!health.isConnected || !health.isRunning) {
        this.logger.warn(`Attempting to restart unhealthy consumer: ${name}`);
        
        try {
          // Note: In a real implementation, you might want to implement
          // a restart mechanism in the base consumer service
          this.logger.log(`Consumer ${name} needs manual intervention for restart`);
        } catch (error) {
          this.logger.error(`Failed to restart consumer ${name}:`, error);
        }
      }
    }
  }

  private async shutdownAllConsumers(): Promise<void> {
    this.logger.log('Shutting down all consumers...');
    
    const shutdownPromises = Array.from(this.consumers.values()).map(async (consumer) => {
      try {
        await consumer.onModuleDestroy();
      } catch (error) {
        this.logger.error('Error during consumer shutdown:', error);
      }
    });
    
    await Promise.all(shutdownPromises);
  }

  public getHealth(): ConsumerManagerHealth {
    const consumersHealth: Record<string, ConsumerHealth> = {};
    let activeConsumers = 0;
    let unhealthyConsumers = 0;
    
    for (const [name, consumer] of this.consumers.entries()) {
      const health = consumer.getHealth();
      consumersHealth[name] = health;
      
      if (health.isConnected && health.isRunning) {
        activeConsumers++;
      } else {
        unhealthyConsumers++;
      }
    }
    
    let overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    if (unhealthyConsumers === 0) {
      overallHealth = 'healthy';
    } else if (unhealthyConsumers < this.consumers.size) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'unhealthy';
    }
    
    return {
      totalConsumers: this.consumers.size,
      activeConsumers,
      consumers: consumersHealth,
      overallHealth,
    };
  }

  public async pauseConsumer(name: string): Promise<void> {
    const consumer = this.consumers.get(name);
    if (consumer) {
      await consumer.pause();
      this.logger.log(`Paused consumer: ${name}`);
    } else {
      throw new Error(`Consumer not found: ${name}`);
    }
  }

  public async resumeConsumer(name: string): Promise<void> {
    const consumer = this.consumers.get(name);
    if (consumer) {
      await consumer.resume();
      this.logger.log(`Resumed consumer: ${name}`);
    } else {
      throw new Error(`Consumer not found: ${name}`);
    }
  }

  public async pauseAllConsumers(): Promise<void> {
    this.logger.log('Pausing all consumers...');
    
    const pausePromises = Array.from(this.consumers.entries()).map(async ([name, consumer]) => {
      try {
        await consumer.pause();
        this.logger.log(`Paused consumer: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to pause consumer ${name}:`, error);
      }
    });
    
    await Promise.all(pausePromises);
  }

  public async resumeAllConsumers(): Promise<void> {
    this.logger.log('Resuming all consumers...');
    
    const resumePromises = Array.from(this.consumers.entries()).map(async ([name, consumer]) => {
      try {
        await consumer.resume();
        this.logger.log(`Resumed consumer: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to resume consumer ${name}:`, error);
      }
    });
    
    await Promise.all(resumePromises);
  }

  public getConsumerNames(): string[] {
    return Array.from(this.consumers.keys());
  }

  public getConsumer(name: string): BaseConsumerService | undefined {
    return this.consumers.get(name);
  }
} 