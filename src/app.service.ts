import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  addNumbers(a:number,b:number){
    return a+b
  }
}
