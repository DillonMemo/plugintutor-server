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

      const thumbnailStreams = await this.shortcutService.generateThumbnail(
        videoPath,
      );

      // ffmpeg(videoPath)
      //   .on('filenames', (filenames, unknown) => {
      //     thumbsFilePaths = filenames.map(
      //       (name: string) => `uploads/thumbnails/${name}`,
      //     );
      //     console.log('Will generate', thumbsFilePaths);
      //   })
      //   .on('end', () => {
      //     console.count('Thumbnails generated successfully');
      //     return response.json({
      //       success: true,
      //       thumbsFilePaths,
      //       fileDuration,
      //     });
      //   })
      //   .on('error', (error) => {
      //     console.error('Error generating thumbnails:', error);
      //     return response.json({ success: false, error });
      //   })
      //   .screenshots({
      //     count: 10,
      //     timemarks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], // 1초 간격으로 생성
      //     folder: 'uploads/thumbnails',
      //     size: '320x240',
      //     filename: 'thumbnail-%i.png',
      //   });

      console.log('finish', thumbnailStreams);
    } catch (error) {
      console.error(error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(error.message || 'Internal Server Error');
    }
  }
}
