import { Test, TestingModule } from '@nestjs/testing';
import { ShortcutController } from './shortcut.controller';
import { ShortcutService } from './shortcut.service';

describe('ShortcutController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ShortcutController],
      providers: [ShortcutService],
    }).compile();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const shortcutController = app.get(ShortcutController);
      expect(shortcutController.getHello()).toBe('Hello World!');
    });
  });
});
