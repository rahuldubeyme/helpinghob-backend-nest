import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum BookingStatus {
    ON_THE_WAY = 'on_the_way',
    REACHED    = 'reached',
    COMPLETED  = 'completed',
    CANCELLED  = 'cancelled',
}

// Valid transitions: pending → on_the_way → reached → started → completed
//                   any     → cancelled
const ALLOWED_TRANSITIONS: Record<string, BookingStatus[]> = {
    accepted:    [BookingStatus.ON_THE_WAY, BookingStatus.CANCELLED],
    on_the_way:  [BookingStatus.REACHED,    BookingStatus.CANCELLED],
    reached:     [BookingStatus.CANCELLED],   // next step is startService (OTP)
    started:     [BookingStatus.COMPLETED,  BookingStatus.CANCELLED],
};

export function isValidTransition(current: string, next: BookingStatus): boolean {
    return ALLOWED_TRANSITIONS[current]?.includes(next) ?? false;
}

export class UpdateBookingStatusDto {
    @ApiProperty({
        enum: BookingStatus,
        example: BookingStatus.ON_THE_WAY,
        description: 'on_the_way → reached → (start via OTP) → completed | cancelled',
    })
    @IsEnum(BookingStatus, {
        message: `status must be one of: ${Object.values(BookingStatus).join(', ')}`,
    })
    status: BookingStatus;
}
