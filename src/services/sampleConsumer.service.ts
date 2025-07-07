import { Injectable } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { KafkaTopics } from 'src/kafkaTopicConfigurations/kafka-topics.enum';

@Injectable()
export class sampleConsumerService extends KafkaConsumerService {
  constructor() {
    // Pass specific topic and groupId to the base service
    super(
      'order-consumer',                          // clientId
      ['localhost:9093'], // brokers
      "Orders-consumer-group",   // groupId from config
      KafkaTopics.ORDERS     // topic from config
    );
  }

  // Override the onMessage method for specific message processing
  protected async onMessage(message: any) {
    console.log(`Processing message for Sample Topic: ${message.value?.toString()}`);
    // Add your specific logic for processing messages from this topic
    for(let i=0;i<100000;i++){
      continue
    }
    
  }
}
