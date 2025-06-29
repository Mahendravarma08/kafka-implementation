import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from 'src/services/kafka-producer.service';
import { kafkaTopics } from 'src/services/kafka-topics.config';

@Injectable()
export class MessageService {
    constructor(private readonly producerService:KafkaProducerService){}

    sendMessage(){
        for(let i=0;i<10;i++){
            this.producerService.produceMessage(kafkaTopics.topic_1.topic,JSON.stringify({name:"mahi",index:i}))
        }
        for(let i=0;i<10;i++){
            this.producerService.produceMessage(kafkaTopics.topic_2.topic,JSON.stringify({name:"manoj",index:i}))
        }
    }
}
