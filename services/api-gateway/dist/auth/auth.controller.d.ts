import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    schoolId: string;
    campusId?: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: any;
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
export {};
