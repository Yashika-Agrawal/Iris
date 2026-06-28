import { NextResponse } from 'next/server';
import { getTenantId } from '../../../lib/tenant';
import { DataService } from '../../../lib/data-service';

export async function GET() {
  try {
    const tenantId = await getTenantId();
    const service = new DataService(tenantId);
    const settings = await service.getSettings();
    return NextResponse.json({ tenantId, ...settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
