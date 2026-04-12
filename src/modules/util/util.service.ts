import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
    private readonly s3: S3;
    private readonly bucket: string;
    private readonly region: string;
    private readonly folder?: string;
    private readonly EXPIRY_SECONDS = 3600; // 1 hour

    constructor(private readonly configService: ConfigService) {
        this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || '';
        this.region = this.configService.get<string>('S3_REGION') || '';
        this.folder = this.configService.get<string>('AWS_S3_FOLDER');

        this.s3 = new S3({
            region: this.region,
            signatureVersion: 'v4',
            accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
            secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
        });
    }

    async getPresignedUploadUrls(location: string, type: string, count: number) {
        if (!location || !type || !count) {
            throw new BadRequestException('Invalid upload parameters');
        }

        const s3BaseUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com`;
        const contentType = this.getContentType(type);

        const urls = await Promise.all(
            Array.from({ length: count }).map(async () => {
                const fileName = `${uuidv4()}.${type}`;
                const key = this.folder ? `${this.folder}/${location}/${fileName}` : `${location}/${fileName}`;

                const url = await this.s3.getSignedUrlPromise('putObject', {
                    Bucket: this.bucket,
                    Key: key,
                    Expires: this.EXPIRY_SECONDS,
                    ContentType: contentType,
                    ACL: 'public-read',
                });

                return {
                    url,
                    preview: `${s3BaseUrl}/${key}`,
                    filename: key,
                };
            })
        );

        return urls;
    }

    async deleteFile(key: string) {
        return this.s3.deleteObject({
            Bucket: this.bucket,
            Key: key
        }).promise();
    }

    private getContentType(extension: string): string {
        const map: Record<string, string> = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            png: 'image/png',
            pdf: 'application/pdf',
            mp4: 'video/mp4',
        };
        return map[extension.toLowerCase()] || 'application/octet-stream';
    }
}
