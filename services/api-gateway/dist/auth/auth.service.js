"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const database_service_1 = require("../database/database.service");
let AuthService = class AuthService {
    db;
    jwtService;
    config;
    constructor(db, jwtService, config) {
        this.db = db;
        this.jwtService = jwtService;
        this.config = config;
    }
    async login(email, password) {
        const users = await this.db.query(`SELECT u.*, s.id as school_id FROM users u
       JOIN schools s ON s.id = u.school_id
       WHERE u.email = $1 AND u.is_active = true
       LIMIT 1`, [email]);
        if (!users.length)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const user = users[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            schoolId: user.school_id,
            campusId: user.campus_id,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
                schoolId: user.school_id,
            },
        };
    }
    async register(dto) {
        const schools = await this.db.query(`SELECT id FROM schools WHERE id = $1 AND subscription_status = 'ACTIVE'`, [dto.schoolId]);
        if (!schools.length) {
            throw new common_1.BadRequestException('School not found or inactive. Contact your administrator.');
        }
        const existing = await this.db.query(`SELECT id FROM users WHERE school_id = $1 AND email = $2`, [dto.schoolId, dto.email]);
        if (existing.length) {
            throw new common_1.ConflictException('A user with this email already exists in this school.');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const rows = await this.db.queryWithTenant(dto.schoolId, `INSERT INTO users (school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING id, email, role`, [
            dto.schoolId,
            dto.campusId || null,
            dto.role,
            dto.email,
            passwordHash,
            dto.firstName,
            dto.lastName,
        ]);
        return rows[0];
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map