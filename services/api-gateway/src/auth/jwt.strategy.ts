import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './auth.service';
import { getJwtSecret, readCookie, SESSION_COOKIE } from '../common/security';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly redis: RedisService,
  ) {
    super({
      // Browsers authenticate with the HttpOnly cookie; API clients may still send a Bearer header.
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => readCookie(req?.headers?.cookie, SESSION_COOKIE),
      ]),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(config), // no fallback: fails fast at startup
      algorithms: ['HS256'],
    });
  }

  async validate(payload: JwtPayload & { typ?: string; iat?: number; jti?: string }) {
    // MFA-challenge / MFA-setup tokens share the signing key: they must never work as access tokens.
    if (payload.typ !== 'access') {
      throw new UnauthorizedException('Invalid token type.');
    }
    if (payload.jti && (await this.redis.get(`rt:${payload.jti}`))) {
      throw new UnauthorizedException('Signed out. Please sign in again.');
    }
    // "Sign out other devices": tokens issued before the revocation mark are rejected.
    const revokedBefore = await this.redis.get<number>(`rv:${payload.sub}`);
    if (revokedBefore && (payload.iat ?? 0) * 1000 < revokedBefore) {
      throw new UnauthorizedException('Session has been revoked. Please sign in again.');
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      schoolId: payload.schoolId,
      campusId: payload.campusId,
    };
  }
}
