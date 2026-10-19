import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

export const DATABASE_POOL = 'DATABASE_POOL';

@Injectable()
export class DatabaseService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  /**
   * Execute a query WITHOUT RLS tenant isolation (for auth/bootstrap queries).
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows as T[];
  }

  /**
   * Execute a query WITH session-scoped Row-Level Security tenant context.
   * All per-tenant data queries MUST use this method.
   */
  async queryWithTenant<T = any>(
    schoolId: string,
    text: string,
    params?: any[],
  ): Promise<T[]> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Inject tenant context for RLS policies
      await client.query(
        `SET LOCAL app.current_tenant_id = '${schoolId}'`,
      );
      const result = await client.query(text, params);
      await client.query('COMMIT');
      return result.rows as T[];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
