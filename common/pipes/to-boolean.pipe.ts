import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ToBooleanPipe implements PipeTransform {
  transform(value: any): boolean {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    throw new BadRequestException(`Invalid boolean value: ${value}`);
  }
}
