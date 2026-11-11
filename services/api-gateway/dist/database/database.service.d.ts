import { Pool, PoolClient } from 'pg';
export declare const DATABASE_POOL = "DATABASE_POOL";
export declare const PUBLIC_HUB_TENANT_ID = "00000000-0000-0000-0000-000000000000";
export declare class DatabaseService {
    private readonly pool;
    constructor(pool: Pool);
    query<T = any>(text: string, params?: any[]): Promise<T[]>;
    queryWithTenant<T = any>(schoolId: string, text: string, params?: any[]): Promise<T[]>;
    withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
}
