import { Body, Controller, Post } from '@nestjs/common';
import { MessageService } from 'src/messages/services/message/message.service';
import { KafkaProducerService } from 'src/services/kafka-producer.service';
import { kafkaTopics } from 'src/services/kafka-topics.config';

@Controller('message')
export class MessageController {
    constructor(private readonly producerService:KafkaProducerService,private readonly messageService:MessageService){}


    @Post('publishMessages')
    async sendMessage(@Body() body){
        this.messageService.sendMessage(body)
    }
}
