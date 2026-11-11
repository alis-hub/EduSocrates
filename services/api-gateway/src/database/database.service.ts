import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

export const DATABASE_POOL = 'DATABASE_POOL';
export const PUBLIC_HUB_TENANT_ID = '00000000-0000-0000-0000-000000000000';

@Injectable()
export class DatabaseService {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  /**
   * Execute a query WITHOUT RLS tenant isolation (for auth/bootstrap/public queries).
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
      await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [schoolId]);
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

  /**
   * Execute an atomic multi-step transaction (e.g. 6-step school onboarding or learner migration).
   */
  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
