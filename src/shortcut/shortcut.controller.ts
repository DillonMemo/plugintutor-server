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

      fs.unlinkSync(videoPath);
      return response
        .status(HttpStatus.OK)
        .json({ ...thumbnailStreams, video: file });
    } catch (error) {
      console.error(error);
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, error });
    }
  }
}
