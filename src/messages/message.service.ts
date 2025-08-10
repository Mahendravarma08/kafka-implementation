import { Injectable } from '@nestjs/common';
import { KafkaProducerService } from 'src/services/kafka-producer.service';
import * as moment from 'moment';

@Injectable()
export class MessageService {
  constructor(private readonly producerService: KafkaProducerService) {}

  sendMessage(body) {
    const messages = [];
    for (let i = 0; i < body.frequency; i++) {
      const message = {};
      if (i % 2 == 0) {
        message['key'] = `sameTopic_${moment().format('YYYY-MM-DD HH:mm')}`;
        message['value'] = `Message is produced at ${moment().format('YYYY-MM-DD HH:mm:ss')} for a same partition I guess.`
      } else {
        message['key'] = null
        message['value'] = `Message is produced at ${moment().format('YYYY-MM-DD HH:mm:ss')} normally.`
      }
      messages.push(message);
    }
    this.producerService.produceMessage('orders', messages);
  }
}
