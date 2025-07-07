// src/kafka/kafka.producer.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CompressionTypes, Kafka, logLevel } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka = new Kafka({
    clientId: 'client-producer',
    brokers: ['localhost:9093'],
    logLevel: logLevel.ERROR,
  });

  private producer = this.kafka.producer({
    allowAutoTopicCreation: false,
    idempotent:true,
    maxInFlightRequests:5,
    retry:{
      retries:2
    }
  });

  async onModuleInit() {
    try {
      await this.producer.connect();
      console.log('Kafka Producer connected');
    } catch (error) {
      console.error('Error during producer connection:', error);
    }
  }

  async produceMessage(topicKey: string, data) {
    try {
      console.log(data,"messagessssss")
      const result = await this.producer.send({
        topic:topicKey,
        messages:data,
        compression: CompressionTypes.GZIP
      });

      console.log(result,"result")

    result.forEach((res) => {
      console.log(`✅ Batch sent to topic: ${res['topic']}`);
      console.log(`👉 Partition: ${res.partition} | Offset: ${res.offset}`);
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
