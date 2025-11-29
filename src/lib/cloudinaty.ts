import { v2 as cloudinary } from 'cloudinary';
import config from '@/Config';
import type { UploadApiResponse } from 'cloudinary';
import { buffer } from 'stream/consumers';
import { resolve } from 'path';
import { Result } from 'express-validator';
import { logger } from './winston';

cloudinary.config({
  cloud_name: config.CLOUDINARY_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET_KEY,
  secure: config.NODE_ENV === 'production',
});

const uploadToCloudinary = (
  buffer: Buffer<ArrayBufferLike>,
  publicId?: string,
): Promise<UploadApiResponse | undefined> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          allowed_formats: ['png', 'jpg', 'webp'],
          resource_type: 'image',
          folder: 'blog-API',
          public_id: publicId,
          transformation: { quality: 'auto' },
        },
        (err, result) => {
          if (err) {
            logger.error('uploading image failed', err);
            reject(err);
          }
          resolve(result);
        },
      )
      .end(buffer);
  });
};

export default uploadToCloudinary;
