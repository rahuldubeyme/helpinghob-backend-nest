import { BadRequestException, PipeTransform } from '@nestjs/common';

export class FileValidationPipe implements PipeTransform {
    transform(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException('Invalid file type');
        }

        return file;
    }
}
