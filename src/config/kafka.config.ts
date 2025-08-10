import { KafkaConfig, ConsumerConfig } from 'kafkajs';

export interface KafkaConsumerConfig {
  clientId: string;
  brokers: string[];
  groupId: string;
  topic: string;
  autoCommit: boolean;
  autoCommitInterval: number;
  autoCommitThreshold: number;
  maxWaitTimeInMs: number;
  sessionTimeout: number;
  heartbeatInterval: number;
  rebalanceTimeout: number;
  maxBytesPerPartition: number;
  minBytes: number;
  maxBytes: number;
  retry: {
    initialRetryTime: number;
    retries: number;
  };
  isolationLevel: 'read_uncommitted' | 'read_committed';
}

export interface KafkaProducerConfig {
  clientId: string;
  brokers: string[];
  acks: number;
  timeout: number;
  compression: boolean;
  retry: {
    initialRetryTime: number;
    retries: number;
  };
}

export const kafkaConfig = {
  // Consumer configurations for different topics
  consumers: {
    orders: {
      clientId: process.env.KAFKA_ORDERS_CLIENT_ID || 'orders-consumer',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092,localhost:9093').split(','),
      groupId: process.env.KAFKA_ORDERS_GROUP_ID || 'orders-consumer-group',
      topic: 'orders',
      autoCommit: true,
      autoCommitInterval: 5000,
      autoCommitThreshold: 100,
      maxWaitTimeInMs: 5000,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      rebalanceTimeout: 60000,
      maxBytesPerPartition: 1048576, // 1MB
      minBytes: 1,
      maxBytes: 1048576, // 1MB
      retry: {
        initialRetryTime: 1000,
        retries: 3,
      },
      isolationLevel: 'read_committed' as const,
    },
    notification: {
      clientId: process.env.KAFKA_NOTIFICATION_CLIENT_ID || 'notification-consumer',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092,localhost:9093').split(','),
      groupId: process.env.KAFKA_NOTIFICATION_GROUP_ID || 'notification-consumer-group',
      topic: 'notification',
      autoCommit: true,
      autoCommitInterval: 5000,
      autoCommitThreshold: 100,
      maxWaitTimeInMs: 5000,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      rebalanceTimeout: 60000,
      maxBytesPerPartition: 1048576, // 1MB
      minBytes: 1,
      maxBytes: 1048576, // 1MB
      retry: {
        initialRetryTime: 1000,
        retries: 3,
      },
      isolationLevel: 'read_committed' as const,
    },
  },
  
  // Producer configuration
  producer: {
    clientId: process.env.KAFKA_PRODUCER_CLIENT_ID || 'kafka-producer',
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092,localhost:9093').split(','),
    acks: 1,
    timeout: 30000,
    compression: true,
    retry: {
      initialRetryTime: 1000,
      retries: 3,
    },
  },
  
  // Global Kafka settings
  global: {
    connectionTimeout: 3000,
    authenticationTimeout: 1000,
    reauthenticationThreshold: 10000,
    requestTimeout: 30000,
    enforceRequestTimeout: true,
    retry: {
      initialRetryTime: 100,
      retries: 8,
      factor: 0.8,
      maxRetryTime: 30000,
    },
  },
};

export const getConsumerConfig = (consumerType: keyof typeof kafkaConfig.consumers): KafkaConsumerConfig => {
  return kafkaConfig.consumers[consumerType];
};

export const getProducerConfig = (): KafkaProducerConfig => {
  return kafkaConfig.producer;
}; 