import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaProducerService } from './services/kafka-producer.service';
import { MessagesModule } from './messages/messages.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaModule } from './kafka/kafka.module';
import { sampleConsumerService } from './services/sampleConsumer.service';
import { PunchConsumerService } from './services/punch-consumer.service';
import { KafkaAdminService } from './services/kafka-admin.service';

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
  providers: [AppService,KafkaAdminService, KafkaProducerService,sampleConsumerService, PunchConsumerService],
})
export class AppModule {}
