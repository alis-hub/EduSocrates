import { Pool } from 'pg';
export declare const DATABASE_POOL = "DATABASE_POOL";
export declare class DatabaseService {
    private readonly pool;
    constructor(pool: Pool);
    query<T = any>(text: string, params?: any[]): Promise<T[]>;
    queryWithTenant<T = any>(schoolId: string, text: string, params?: any[]): Promise<T[]>;
}
