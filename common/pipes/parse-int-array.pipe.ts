import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIntArrayPipe implements PipeTransform {
  transform(value: string): number[] {
    try {
      return value
        .split(',')
        .map((val) => parseInt(val.trim(), 10))
        .filter((num) => !isNaN(num));
    } catch {
      throw new BadRequestException('Invalid array format');
    }
  }
}
