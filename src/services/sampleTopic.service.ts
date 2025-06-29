import { Injectable } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { kafkaTopics } from './kafka-topics.config';

@Injectable()
export class SampleTopicConsumerService extends KafkaConsumerService {
  constructor() {
    // Pass specific topic and groupId to the base service
    super(
      'my-app',                          // clientId
      ['localhost:9092'],                 // brokers
      kafkaTopics.topic_2.groupId,   // groupId from config
      kafkaTopics.topic_2.topic     // topic from config
    );
  }

  // Override the onMessage method for specific message processing
  protected async onMessage(message: any) {
    await setTimeout(() => {
      console.log("finished set time out")
    }, 5000);
    console.log(message,"message")
    console.log(`Processing message for Sample Topic: ${message.value?.toString()}`);
    // Add your specific logic for processing messages from this topic
  }
}
