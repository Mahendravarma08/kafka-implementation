import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from 'src/services/kafka-producer.service';
import { kafkaTopics } from 'src/services/kafka-topics.config';

@Injectable()
export class MessageService {
    constructor(private readonly producerService:KafkaProducerService){}

    sendMessage(body){
            this.producerService.produceMessage("PUNCH",[{"punchType":"BIOMETRIC","punchTime":"2025-0c6-06 18:00:00"}])
        
    }
}
