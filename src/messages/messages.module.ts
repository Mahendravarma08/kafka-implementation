import { Module } from '@nestjs/common';
import { MessageController } from './controllers/message/message.controller';
import { MessageService } from './services/message/message.service';
import { KafkaProducerService } from 'src/services/kafka-producer.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService,KafkaProducerService]
})
export class MessagesModule {}
