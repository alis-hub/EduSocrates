"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = exports.DATABASE_POOL = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
exports.DATABASE_POOL = 'DATABASE_POOL';
let DatabaseService = class DatabaseService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    async query(text, params) {
        const result = await this.pool.query(text, params);
        return result.rows;
    }
    async queryWithTenant(schoolId, text, params) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`SET LOCAL app.current_tenant_id = '${schoolId}'`);
            const result = await client.query(text, params);
            await client.query('COMMIT');
            return result.rows;
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(exports.DATABASE_POOL)),
    __metadata("design:paramtypes", [pg_1.Pool])
], DatabaseService);
//# sourceMappingURL=database.service.js.map