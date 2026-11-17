import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
import { attachWhiteboardWs } from './hub/whiteboard.ws';
import { getCorsOrigins, getJwtSecret, readCookie, SESSION_COOKIE } from './common/security';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const config = app.get(ConfigService);
  getJwtSecret(config); // fail fast on a missing/weak secret

  // Behind a reverse proxy (nginx, Cloudflare, Render…) set TRUST_PROXY=1 so req.ip is the real client IP.
  const trustProxy = config.get<string>('TRUST_PROXY');
  if (trustProxy) app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);

  app.use(helmet());
  app.useBodyParser('json', { limit: '256kb' });
  app.useBodyParser('urlencoded', { limit: '64kb', extended: true });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  // Cookie-authenticated requests that change data must come from one of our own sites (CSRF defence
  // on top of SameSite). Requests that use an Authorization header are not affected.
  const allowedOrigins = getCorsOrigins(config);
  app.use((req: any, res: any, next: any) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (req.headers.authorization || !readCookie(req.headers.cookie, SESSION_COOKIE)) return next();
    let origin: string | undefined = req.headers.origin;
    if (!origin && req.headers.referer) {
      try { origin = new URL(req.headers.referer).origin; } catch { /* ignore */ }
    }
    if (origin && allowedOrigins.includes(origin)) return next();
    res.status(403).json({ statusCode: 403, message: 'Cross-site request blocked.' });
  });

  app.enableCors({
    origin: getCorsOrigins(config),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });
  app.setGlobalPrefix('api/v1');

  // Render and similar hosts provide the port in PORT.
  const port = config.get<string>('API_PORT') || config.get<string>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');

  try {
    const db = app.get(DatabaseService);
    const jwt = app.get(JwtService);
    attachWhiteboardWs(app.getHttpServer(), db, {
      allowedOrigins: getCorsOrigins(config),
      verifyToken: async (token) => {
        try {
          const payload: any = await jwt.verifyAsync(token, { secret: getJwtSecret(config), algorithms: ['HS256'] });
          if (payload.typ !== 'access' || !payload.sub || !payload.schoolId) return null;
          return { sub: payload.sub, schoolId: payload.schoolId };
        } catch {
          return null;
        }
      },
    });
  } catch (err) {
    console.warn('Whiteboard WebSocket upgrade attachment skipped:', err);
  }

  console.log(`GuruMera API Gateway running on port ${port}`);
}
bootstrap();
