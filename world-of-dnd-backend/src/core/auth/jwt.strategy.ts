import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          if (!req) return null;
          // Prefer cookie named access_token for server-rendered admin pages
          if (req.cookies && req.cookies.access_token) return req.cookies.access_token;
          // Fallback to Authorization header Bearer token
          const auth = req.headers && (req.headers.authorization || req.headers.Authorization);
          if (auth) {
            const parts = auth.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') return parts[1];
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET') || 'supersecretkey',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
