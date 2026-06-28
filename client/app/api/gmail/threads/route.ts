import { NextResponse } from 'next/server';
import { getTenantId } from '../../../../lib/tenant';
import { DataService } from '../../../../lib/data-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tenantId = await getTenantId();
    const service = new DataService(tenantId);
    const threads = await service.getThreads();
    return NextResponse.json(threads);
  } catch (error: any) {
    if (error.message && error.message.includes('Account not found')) {
      // User is not connected, gracefully ignore
    } else {
      console.error('Error fetching threads:', error);
    }
    return NextResponse.json([]);
  }
}
