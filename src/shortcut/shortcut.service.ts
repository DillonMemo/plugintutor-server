import { Injectable } from '@nestjs/common';

@Injectable()
export class ShortcutService {
  getHello(): string {
    return 'Hello World!';
  }
}
