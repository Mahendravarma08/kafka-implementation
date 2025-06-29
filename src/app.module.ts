import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaProducerService } from './services/kafka-producer.service';
import { MessagesModule } from './messages/messages.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './kafka/kafka.module';
import { SampleTopicConsumerService } from './services/sampleTopic.service';
import { sampleConsumerService } from './services/sampleConsumer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // This makes the config available globally
      envFilePath: '.env', // Path to the .env file (root folder in this case)
    }),
    MessagesModule,
    KafkaModule
  ],
  controllers: [AppController],
  providers: [AppService, KafkaProducerService, SampleTopicConsumerService,sampleConsumerService],
})
export class AppModule {}
