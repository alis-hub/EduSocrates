import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DatabaseService } from './database/database.service';
import { attachWhiteboardWs } from './hub/whiteboard.ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
  });
  app.setGlobalPrefix('api/v1');

  const port = process.env.API_PORT || 3000;
  await app.listen(port, '0.0.0.0');

  try {
    const db = app.get(DatabaseService);
    attachWhiteboardWs(app.getHttpServer(), db);
  } catch (err) {
    console.warn('Whiteboard WebSocket upgrade attachment skipped:', err);
  }

  console.log(`EduSocrates API Gateway running on port ${port}`);
}
bootstrap();
