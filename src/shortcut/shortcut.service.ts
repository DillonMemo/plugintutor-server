import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';

interface GenerateThumbnailOutput {
  success: boolean;
  error?: Error;
  streams?: fs.ReadStream;
}
@Injectable()
export class ShortcutService {
  getHello(): string {
    return 'Hello World!';
  }

  async generateThumbnail(videoPath: string): Promise<GenerateThumbnailOutput> {
    const dir = 'uploads/thumbnails';
    const divider = 15;
    let readStreams = [];
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
      ffmpeg.ffprobe(videoPath, (error, metadata) => {
        if (error) {
          console.error('Error getting video metadata:', error);
          reject({ success: false, error });
        }

        const durationInSeconds = metadata.format.duration; // 총 영상 길이 (초 단위)
        const interval = durationInSeconds / divider; // 총 영상 길이 기준 간격 계산
        ffmpeg(videoPath)
          .on('filenames', (filenames) => {
            Array.isArray(filenames) &&
              (readStreams = filenames.map((name) => `${dir}/${name}`));
          })
          .on('end', () => {
            let streams = [];
            readStreams.forEach((thumbnailPath) => {
              streams = [...streams, fs.readFileSync(thumbnailPath)];
            });
            console.log('Thumbnail generated successfully');
            resolve({ success: true, streams });
          })
          .on('error', (error) => {
            console.error('Error generating thumbnail:', error);
            reject({ success: false, error });
          })
          .screenshots({
            count: divider,
            timemarks: Array.from(
              { length: divider },
              (_, index) => index * interval,
            ), // 1초 간격으로 생성
            folder: dir,
            size: '320x240',
            filename: 'thumbnail-%i.png',
          });
      });
    });
  }
}
