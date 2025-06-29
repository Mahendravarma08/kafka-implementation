// src/kafka/kafka.producer.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { kafkaTopics } from './kafka-topics.config';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
    
  });

  private producer = this.kafka.producer();

  async onModuleInit() {
    try {
      await this.producer.connect();
      console.log('Kafka Producer connected');
    } catch (error) {
      console.error('Error during producer connection:', error);
    }
  }

  async produceMessage(topicKey: string, message: string) {
    try {
      const result = await this.producer.send({
        topic:topicKey,
        messages: [{ value: message }],
      });

      result.forEach((res) => {
        console.log('Message sent to topic:', res['topic']);
        console.log('Message sent to partition:', res.partition);  // Partition info
        console.log('Offset of the message:', res.offset);  // Offset info
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      console.log('Kafka Producer disconnected');
    } catch (error) {
      console.error('Error during producer disconnection:', error);
    }
  }
}
