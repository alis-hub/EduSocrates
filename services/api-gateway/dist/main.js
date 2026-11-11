"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const database_service_1 = require("./database/database.service");
const whiteboard_ws_1 = require("./hub/whiteboard.ws");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
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
        const db = app.get(database_service_1.DatabaseService);
        (0, whiteboard_ws_1.attachWhiteboardWs)(app.getHttpServer(), db);
    }
    catch (err) {
        console.warn('Whiteboard WebSocket upgrade attachment skipped:', err);
    }
    console.log(`EduSocrates API Gateway running on port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map