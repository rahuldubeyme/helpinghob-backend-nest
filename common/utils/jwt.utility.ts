import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

export class JwtUtility {
  private static jwtService: JwtService;

  static init(configService: ConfigService): void {
    JwtUtility.jwtService = new JwtService({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '7d') as any },
    });
  }

  static generateToken(payload: any, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }

  static verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      console.log(error);
      // Handle token verification error
      return null;
    }
  }
}
