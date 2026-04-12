export interface JwtPayload {
  sub: number; // user ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
