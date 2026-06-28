import crypto from 'crypto';
import { pool } from './corsair';

export type CacheOptions = {
  ttl: number;
  type: string;
  key: string;
};

export async function getCached<T>(
  accountId: string,
  options: CacheOptions,
  fetchFn: () => Promise<T>
): Promise<T> {
  const entityId = `${accountId}:${options.type}:${options.key}`;

  const dbRes = await pool.query(
    `SELECT data, created_at FROM corsair_entities 
     WHERE entity_type = 'cache' AND entity_id = $1`,
    [entityId]
  );

  if (dbRes.rows.length > 0) {
    const age = Date.now() - new Date(dbRes.rows[0].created_at).getTime();
    if (age < options.ttl) {
      return dbRes.rows[0].data as T;
    }
  }

  const data = await fetchFn();

  await pool.query(
    `INSERT INTO corsair_entities (id, account_id, entity_id, entity_type, version, data, created_at, updated_at)
     VALUES ($1, $2, $3, 'cache', '1', $4, NOW(), NOW())
     ON CONFLICT (entity_type, entity_id) DO UPDATE 
     SET data = $4, updated_at = NOW(), created_at = NOW()`,
    [crypto.randomUUID(), accountId, entityId, JSON.stringify(data)]
  );

  return data;
}

export async function invalidateCache(accountId: string, type?: string): Promise<void> {
  if (type) {
    await pool.query(
      `DELETE FROM corsair_entities WHERE entity_type = 'cache' AND entity_id LIKE $1`,
      [`${accountId}:${type}:%`]
    );
  } else {
    await pool.query(
      `DELETE FROM corsair_entities WHERE entity_type = 'cache' AND entity_id LIKE $1`,
      [`${accountId}:%`]
    );
  }
}
