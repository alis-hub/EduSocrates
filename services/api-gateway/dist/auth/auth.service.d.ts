import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    schoolId: string;
    campusId?: string;
}
export interface RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    schoolId: string;
    campusId?: string;
}
export declare class AuthService {
    private readonly db;
    private readonly jwtService;
    private readonly config;
    constructor(db: DatabaseService, jwtService: JwtService, config: ConfigService);
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: any;
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
