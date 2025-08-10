import { Module } from '@nestjs/common';
import { OrdersConsumerService } from '../services/orders-consumer.service';
import { NotificationConsumerService } from '../services/notification-consumer.service';
import { ConsumerManagerService } from '../services/consumer-manager.service';
import { ConsumerHealthController } from '../controllers/consumer-health.controller';

@Module({
  providers: [
    OrdersConsumerService,
    NotificationConsumerService,
    ConsumerManagerService,
  ],
  controllers: [ConsumerHealthController],
  exports: [
    OrdersConsumerService,
    NotificationConsumerService,
    ConsumerManagerService,
  ],
})
export class KafkaModule {}
