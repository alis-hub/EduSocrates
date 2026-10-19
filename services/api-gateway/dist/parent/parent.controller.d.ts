import { DatabaseService } from '../database/database.service';
export declare class ParentController {
    private readonly db;
    constructor(db: DatabaseService);
    getMyChildren(user: any): Promise<any[]>;
    getChildCoursework(user: any, studentId: string): Promise<any[]>;
}
