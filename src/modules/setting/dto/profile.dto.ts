import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNumber, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';


class DayScheduleDto {
  @ApiProperty({ example: '09:00', required: false })
  @IsString()
  @IsOptional()
  start?: string;

  @ApiProperty({ example: '18:00', required: false })
  @IsString()
  @IsOptional()
  end?: string;
}

class AvailabilityDto {
  @ApiProperty({ type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  Monday: DayScheduleDto;

  @ApiProperty({ type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  Tuesday: DayScheduleDto;

  @ApiProperty({ type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  Wednesday: DayScheduleDto;

  @ApiProperty({ type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  Thursday: DayScheduleDto;

  @ApiProperty({ type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  Friday: DayScheduleDto;

  @ApiProperty({ type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  Saturday: DayScheduleDto;

  @ApiProperty({ type: DayScheduleDto })
  @ValidateNested()
  @Type(() => DayScheduleDto)
  Sunday: DayScheduleDto;
}
export class UpdateProfileDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    firstName?: string;
    
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    countryCode?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    profilePicture?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    companyLogo?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    industry?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    size?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    businessRegistrationNo?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    height?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    weight?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    gender?: string;
    
    @ApiProperty({ required: false, example: 28.6139 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    latitude?: number;

    @ApiProperty({ required: false, example: 77.2090 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    longitude?: number;

    @ApiProperty({
        description: 'Availability schedule per weekday for merchant',
        type: AvailabilityDto,
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => AvailabilityDto)
    availability?: AvailabilityDto;
}





