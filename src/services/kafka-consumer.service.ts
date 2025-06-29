import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(
    private readonly clientId: string,
    private readonly brokers: string[],
    private readonly groupId: string,
    private readonly topic: string
  ) {
    this.kafka = new Kafka({
      clientId: this.clientId,
      brokers: this.brokers,
    });
  }

  async onModuleInit() {
    await this.connectAndStartConsumer();
  }

  private async connectAndStartConsumer() {
    this.consumer = this.kafka.consumer({ groupId: this.groupId });
    await this.consumer.connect();
    console.log(`Consumer connected for topic: ${this.topic}`);
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });
    console.log(`Subscribed to topic: ${this.topic}`);
    this.runConsumer();
  }

  // Method to process the message, can be customized by child classes
  protected async onMessage(message: any) {
    console.log(`Received message: ${message.value?.toString()}`);
    // Default message processing logic (you can override this in child classes)
  }

  private async runConsumer() {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log(
          `Consumer - Topic: ${topic}, Partition: ${partition}, Offset: ${message.offset}, Value: ${message.value?.toString()}`
        );
        await this.onMessage(message);
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    console.log('Consumer disconnected');
  }
}
