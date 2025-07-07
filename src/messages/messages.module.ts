import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { KafkaProducerService } from 'src/services/kafka-producer.service';
import { KafkaAdminService } from 'src/services/kafka-admin.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService,KafkaProducerService,KafkaAdminService]
})
export class MessagesModule {}
