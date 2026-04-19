import { IsNotEmpty, IsString, IsObject, IsOptional, IsNumber } from 'class-validator';

export class SocketRideIdDto {
    @IsNotEmpty()
    @IsString()
    rideId: string;
}

export class SocketAcceptRideDto extends SocketRideIdDto { }

export class SocketUpdateLocationDto extends SocketRideIdDto {
    @IsNotEmpty()
    @IsNumber()
    lat: number;

    @IsNotEmpty()
    @IsNumber()
    lng: number;
}

export class SocketRideStatusUpdateDto extends SocketRideIdDto {
    @IsNotEmpty()
    @IsString()
    status: string;
}

export class SocketCancelRideDto extends SocketRideIdDto {
    @IsNotEmpty()
    @IsString()
    reason: string;
}
