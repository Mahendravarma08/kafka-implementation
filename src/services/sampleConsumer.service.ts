import { Injectable } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { kafkaTopics } from './kafka-topics.config';

@Injectable()
export class sampleConsumerService extends KafkaConsumerService {
  constructor() {
    // Pass specific topic and groupId to the base service
    super(
      'punch-consumer',                          // clientId
      ['localhost:9092'],                 // brokers
      "Punch-Consumer_group",   // groupId from config
      "PUNCH"     // topic from config
    );
  }

  // Override the onMessage method for specific message processing
  protected async onMessage(message: any) {
    console.log(`Processing message for Sample Topic: ${message.value?.toString()}`);
    // Add your specific logic for processing messages from this topic
  }
}
