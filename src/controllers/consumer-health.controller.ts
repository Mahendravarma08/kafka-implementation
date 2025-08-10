import { Controller, Get, Post, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ConsumerManagerService } from '../services/consumer-manager.service';
import { BaseConsumerService } from '../services/base-consumer.service';

@Controller('consumer-health')
export class ConsumerHealthController {
  constructor(private readonly consumerManager: ConsumerManagerService) {}

  @Get()
  getOverallHealth() {
    return this.consumerManager.getHealth();
  }

  @Get('consumers')
  getConsumerNames() {
    return {
      consumers: this.consumerManager.getConsumerNames(),
    };
  }

  @Get('consumers/:name')
  getConsumerHealth(@Param('name') name: string) {
    const consumer = this.consumerManager.getConsumer(name);
    if (!consumer) {
      throw new HttpException(`Consumer '${name}' not found`, HttpStatus.NOT_FOUND);
    }
    
    return {
      name,
      health: consumer.getHealth(),
      config: consumer.getConfig(),
    };
  }

  @Post('consumers/:name/pause')
  async pauseConsumer(@Param('name') name: string) {
    try {
      await this.consumerManager.pauseConsumer(name);
      return {
        message: `Consumer '${name}' paused successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to pause consumer '${name}': ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('consumers/:name/resume')
  async resumeConsumer(@Param('name') name: string) {
    try {
      await this.consumerManager.resumeConsumer(name);
      return {
        message: `Consumer '${name}' resumed successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to resume consumer '${name}': ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('consumers/pause-all')
  async pauseAllConsumers() {
    try {
      await this.consumerManager.pauseAllConsumers();
      return {
        message: 'All consumers paused successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to pause all consumers: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('consumers/resume-all')
  async resumeAllConsumers() {
    try {
      await this.consumerManager.resumeAllConsumers();
      return {
        message: 'All consumers resumed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to resume all consumers: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('metrics')
  getMetrics() {
    const health = this.consumerManager.getHealth();
    const consumers = health.consumers;
    
    const metrics = {
      totalConsumers: health.totalConsumers,
      activeConsumers: health.activeConsumers,
      inactiveConsumers: health.totalConsumers - health.activeConsumers,
      overallHealth: health.overallHealth,
      consumers: Object.entries(consumers).map(([name, consumerHealth]) => ({
        name,
        isConnected: consumerHealth.isConnected,
        isRunning: consumerHealth.isRunning,
        messageCount: consumerHealth.messageCount,
        errorCount: consumerHealth.errorCount,
        lastMessageTime: consumerHealth.lastMessageTime,
        lastError: consumerHealth.lastError?.message,
      })),
      timestamp: new Date().toISOString(),
    };
    
    return metrics;
  }
} 