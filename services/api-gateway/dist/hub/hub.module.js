"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubModule = void 0;
const common_1 = require("@nestjs/common");
const database_module_1 = require("../database/database.module");
const redis_module_1 = require("../redis/redis.module");
const ai_proxy_module_1 = require("../ai-proxy/ai-proxy.module");
const auth_module_1 = require("../auth/auth.module");
const hub_service_1 = require("./hub.service");
const hub_controller_1 = require("./hub.controller");
let HubModule = class HubModule {
};
exports.HubModule = HubModule;
exports.HubModule = HubModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, redis_module_1.RedisModule, ai_proxy_module_1.AiProxyModule, auth_module_1.AuthModule],
        controllers: [hub_controller_1.HubController],
        providers: [hub_service_1.HubService],
        exports: [hub_service_1.HubService],
    })
], HubModule);
//# sourceMappingURL=hub.module.js.map