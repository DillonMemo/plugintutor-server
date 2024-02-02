import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ShortcutController } from './shortcut/shortcut.controller';
import { ShortcutService } from './shortcut/shortcut.service';
import * as Joi from 'joi';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PostInterceptor } from './interceptors/post.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.string(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string(),
        DB_NAME: Joi.string(),
      }),
    }),
  ],
  controllers: [ShortcutController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: PostInterceptor,
    },
    ShortcutService,
  ],
})
export class AppModule {}
