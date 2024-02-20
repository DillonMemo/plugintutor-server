import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';

interface GenerateThumbnailOutput {
  success: boolean;
  error?: Error;
  thumbnails?: Buffer[];
}
@Injectable()
export class ShortcutService {
  getHello(): string {
    return 'Hello World!';
  }

  async generateThumbnail(videoPath: string): Promise<GenerateThumbnailOutput> {
    const dir = 'uploads/thumbnails';
    const mimetype = 'png';
    const divider = 20;
    let readStreams = [];
    return new Promise<GenerateThumbnailOutput>((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (error, metadata) => {
        if (error) {
          console.error('Error getting video metadata:', error);
          reject({ success: false, error });
        }

        const durationInSeconds = metadata.format.duration; // 총 영상 길이 (초 단위)
        const interval = durationInSeconds / divider; // 총 영상 길이 기준 간격 계산
        console.log('time check', durationInSeconds, interval);
        ffmpeg(videoPath)
          .on('filenames', (filenames) => {
            Array.isArray(filenames) &&
              (readStreams = filenames.map((name) => `${dir}/${name}`));
          })
          .on('end', () => {
            let thumbnails = [];
            readStreams.forEach((thumbnailPath: string) => {
              const bufferData = fs.readFileSync(thumbnailPath);
              const fileData = {
                fieldname: 'file',
                originalname: thumbnailPath.replace(`${dir}/`, ''),
                encoding: '7bit',
                mimetype: `image/${mimetype}`,
                buffer: bufferData,
                size: bufferData.length,
                // 이미지 마다 영상 시간의 위치를 같이 보내줄수 있다면?
              };
              thumbnails = [...thumbnails, fileData];

              fs.unlinkSync(thumbnailPath);
            });
            console.log('Thumbnail generated successfully');
            resolve({ success: true, thumbnails });
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
            filename: `thumbnail-%i.${mimetype}`,
          });
      });
    });
  }
}
