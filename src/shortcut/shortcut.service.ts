import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';

interface GenerateThumbnailOutput {
  success: boolean;
  stream?: fs.ReadStream;
}
@Injectable()
export class ShortcutService {
  getHello(): string {
    return 'Hello World!';
  }

  async generateThumbnail(videoPath: string): Promise<GenerateThumbnailOutput> {
    return new Promise<GenerateThumbnailOutput>((resolve, reject) => {
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
      ffmpeg(videoPath)
        .on('end', (stdout, stderr) => {
          console.log('Thumbnail generated successfully', stdout, stderr);
          resolve({ success: true });
        })
        .on('error', (error) => {
          console.error('Error generating thumbnail:', error);
          reject({ success: false });
        })
        .screenshots({
          count: 10,
          timemarks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], // 1초 간격으로 생성
          folder: 'uploads/thumbnails',
          size: '320x240',
          filename: 'thumbnail-%i.png',
        });
    });
  }
}
