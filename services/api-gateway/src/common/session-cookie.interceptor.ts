import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SESSION_COOKIE, isAllowedOrigin, sessionCookieOptions } from './security';

/**
 * Whenever a response carries a new access token, also set it as an HttpOnly cookie.
 * Requests from our own web app (recognised by an allowed Origin header) get the cookie only:
 * the token is removed from the JSON body, so page scripts, and any injected script, never see it.
 * Other clients (tests, tools) have no Origin header and still receive the token in the body.
 */
@Injectable()
export class SessionCookieInterceptor implements NestInterceptor {
  constructor(private readonly config: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data || typeof data !== 'object' || typeof data.accessToken !== 'string') return data;
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        let maxAge = 8 * 60 * 60 * 1000;
        try {
          const exp = JSON.parse(Buffer.from(data.accessToken.split('.')[1], 'base64url').toString()).exp;
          if (exp) maxAge = Math.max(1000, exp * 1000 - Date.now());
        } catch { /* keep the default */ }
        res.cookie(SESSION_COOKIE, data.accessToken, sessionCookieOptions(this.config, maxAge));
        if (isAllowedOrigin(this.config, req.headers?.origin)) {
          const { accessToken, ...rest } = data;
          return rest;
        }
        return data;
      }),
    );
  }
}
