import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

export const DATABASE_POOL = 'DATABASE_POOL'; // privileged "system" role: auth, signup, public hub, bootstrap
export const DATABASE_APP_POOL = 'DATABASE_APP_POOL'; // restricted role: Row-Level Security is ENFORCED
export const PUBLIC_HUB_TENANT_ID = '00000000-0000-0000-0000-000000000000';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class DatabaseService {
  constructor(
    @Inject(DATABASE_POOL) private readonly systemPool: Pool,
    @Inject(DATABASE_APP_POOL) private readonly appPool: Pool,
  ) {}

  /**
   * SYSTEM-level query (privileged role, RLS not applied).
   * Only for: authentication lookups, signup, public-hub content, bootstrap/onboarding.
   * Anything that reads/writes tenant data for a logged-in school user MUST use
   * queryWithTenant() so PostgreSQL itself enforces isolation.
   */
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.systemPool.query(text, params);
    return result.rows as T[];
  }

  /** Tenant-scoped query on the restricted role. RLS is enforced by PostgreSQL. */
  async queryWithTenant<T = any>(schoolId: string, text: string, params?: any[]): Promise<T[]> {
    return this.withTenantTransaction(schoolId, async (client) => {
      const result = await client.query(text, params);
      return result.rows as T[];
    });
  }

  /** Multi-statement transaction on the restricted role with tenant context set. */
  async withTenantTransaction<T>(schoolId: string, fn: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!UUID_RE.test(String(schoolId ?? ''))) {
      throw new Error('Invalid tenant context.');
    }
    const client: PoolClient = await this.appPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [schoolId]);
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }

  /** Multi-step system transaction (onboarding, signup). Privileged role. */
  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client: PoolClient = await this.systemPool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  }
}
