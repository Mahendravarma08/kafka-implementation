// src/kafka/kafka.admin.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, logLevel } from 'kafkajs';
import { TopicConfig } from '../kafkaTopicConfigurations/topic-config';
import { KafkaTopics } from '../kafkaTopicConfigurations/kafka-topics.enum';

@Injectable()
export class KafkaAdminService implements OnModuleInit {
  private kafka = new Kafka({
    clientId: 'admin-client',
    brokers: ['localhost:9093'],
    logLevel: logLevel.ERROR,
  });

  async onModuleInit() {
    const admin = this.kafka.admin();
    await admin.connect();
    console.log('Kafka Admin connected');

          const metadata = await admin.describeCluster();

      console.log(metadata,"metaDataaaa");

    const existingTopics = await admin.listTopics();
    console.log(Object.values(KafkaTopics));
    for (const topicKey of Object.values(KafkaTopics)) {
      if (!existingTopics.includes(topicKey)) {
        const config = TopicConfig[topicKey];
        if (config) {
          await admin.createTopics({
            topics: [
              {
                topic: topicKey,
                numPartitions: config.partitions,
                replicationFactor: config.replicationFactor,
              },
            ],
          });
          console.log(`✅ Topic '${topicKey}' created`);
        }
      } else {
        console.log(`ℹ️ Topic '${topicKey}' already exists`);
      }
    }

    await admin.disconnect();
    console.log('Kafka Admin disconnected');
  }

  async deleteTopic(topicName) {
    const admin = this.kafka.admin();
    try {
      await admin.connect();


      

      // Delete topic
      const existingTopics = await admin.listTopics();
      if (existingTopics.includes(topicName)) {
        console.log(`🗑 Deleting topic: ${topicName}`);
        await admin.deleteTopics({ topics: [topicName] });

        // Wait a bit to let deletion complete
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error('❌ Error in topic reset:', error);
    } finally {
      await admin.disconnect();
    }
  }
}
