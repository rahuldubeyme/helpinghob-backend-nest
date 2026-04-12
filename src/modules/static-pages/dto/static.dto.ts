import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEnum } from "class-validator";

export class StaticContentDto {
  @IsNotEmpty()
  @ApiProperty({
    example: 'privacy-policy/terms-conditions/about-us',
    description: 'Unique slug of the static content',
    required: true,
  })
  slug: string;
}


// static.enums.ts

export enum STATIC_PAGE_TYPE {
  TERMS = 'terms-and-conditions',
  PRIVACY = 'privacy-policy',
  ABOUT = 'about-us',
  FAQ = 'faq',
  ALL = 'all',
}

export enum USER_ROLE_TYPE {
  COMPANY = 'company',
  EMPLOYEE = 'employee',
  VENDOR = 'vendor'
}

export class GetStaticPageParamsDto {
  @ApiProperty({
    enum: USER_ROLE_TYPE,
    example: USER_ROLE_TYPE.COMPANY,
  })
  @IsEnum(USER_ROLE_TYPE)
  role: USER_ROLE_TYPE;

  @ApiProperty({
    enum: STATIC_PAGE_TYPE,
    example: STATIC_PAGE_TYPE.PRIVACY,
  })
  @IsEnum(STATIC_PAGE_TYPE)
  type: STATIC_PAGE_TYPE;
}