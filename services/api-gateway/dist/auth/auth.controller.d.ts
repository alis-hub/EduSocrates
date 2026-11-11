import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
declare class PublicSignupDto {
    email: string;
    password: string;
    firstName: string;
    lastName?: string;
}
declare class RedeemInviteDto {
    inviteCode: string;
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
    publicSignup(dto: PublicSignupDto): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            firstName: any;
            lastName: any;
            schoolId: any;
            campusId: any;
        };
    }>;
    redeemInvite(user: any, dto: RedeemInviteDto): Promise<{
        schoolName: any;
        migrated: boolean;
        accessToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            firstName: any;
            lastName: any;
            schoolId: any;
            campusId: any;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
export {};
