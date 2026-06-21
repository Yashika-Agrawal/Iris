import { NextResponse } from 'next/server';
import { pool } from '../../../../lib/corsair';
import { getTenantId } from '../../../../lib/tenant';

export async function POST() {
  try {
    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First clear cached entities and events to avoid foreign key constraint errors
    await pool.query('DELETE FROM corsair_entities WHERE account_id IN (SELECT id FROM corsair_accounts WHERE tenant_id = $1)', [tenantId]);
    await pool.query('DELETE FROM corsair_events WHERE account_id IN (SELECT id FROM corsair_accounts WHERE tenant_id = $1)', [tenantId]);

    // Then delete OAuth accounts
    await pool.query('DELETE FROM corsair_accounts WHERE tenant_id = $1', [tenantId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to disconnect integrations:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
