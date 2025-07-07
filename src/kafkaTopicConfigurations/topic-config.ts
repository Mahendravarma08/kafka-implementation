import { KafkaTopics } from "./kafka-topics.enum";

export const TopicConfig = {
  [KafkaTopics.ORDERS]: { partitions: 3, replicationFactor: 1 },
  [KafkaTopics.NOTIFICATION]: { partitions: 2, replicationFactor: 1 },
};