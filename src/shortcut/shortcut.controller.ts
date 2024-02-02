import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ShortcutService } from './shortcut.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { Response } from 'express';
import * as path from 'path';
import * as ffmpeg from 'fluent-ffmpeg';

@Controller('shortcut')
export class ShortcutController {
  constructor(private readonly shortcutService: ShortcutService) {}

  @Get()
  getHello(): string {
    return this.shortcutService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Res() response: Response,
  ) {
    try {
      if (!file) throw new BadRequestException('File not found!');

      const uploadsFolder = 'uploads';
      const videoPath = path.join(uploadsFolder, file.originalname);

      // uploads 폴더가 없을 경우 생성
      !fs.existsSync(uploadsFolder) && fs.mkdirSync(uploadsFolder);

      // 업로드된 파일 저장
      fs.writeFileSync(videoPath, file.buffer);

      const command = ffmpeg(videoPath)
        .on('end', () => {
          console.log('Thumbnails generated successfully');
          // let thumbnailStreams: fs.ReadStream[] = []
          for (let i = 1; i <= 10; i++) {
            const thumbnailPath = `uploads/thumbnails/thumbnail-${i}.png`;
            fs.readFile(thumbnailPath, (error, data) => {
              if (error) {
                console.error(`Error reading thumbnail ${i}`, error);
                return;
              }

              console.log('thumbnail', data);
              // thumbnailStreams = [...thumbnailStreams, data]
            });
          }
        })
        .on('error', (error) => {
          console.error('Error generating thumbnails:', error);
          return response.json({ success: false, error });
        })
        .screenshots({
          count: 10,
          timemarks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], // 1초 간격으로 생성
          folder: 'uploads/thumbnails',
          size: '320x240',
          filename: 'thumbnail-%i.png',
        });

      console.log('finish');
      // return response.json({
      //   success: true,
      // });
      // // 또는 바로 응답으로 스트리밍 예시
      // thumbnailStreams.forEach((stream) => {
      //   console.log('thumbnail streams', stream);
      //   stream.pipe(response, { end: false });
      // });

      // // 모든 썸네일을 전송한 후에 응답 종료
      // response.end();
      return file;
    } catch (error) {
      console.error(error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(error.message || 'Internal Server Error');
    }
  }
}
