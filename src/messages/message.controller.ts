import { Body, Controller, Post } from '@nestjs/common';
import { MessageService } from 'src/messages/message.service';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService:MessageService){}


    @Post('publishMessages')
    async sendMessage(@Body() body){
        this.messageService.sendMessage(body)
    }

    @Post('deleteTopic')
    async deleteTopic(){
        this.messageService.deleteTopic()
    }
}
