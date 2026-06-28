import { NextResponse } from 'next/server';
import { getTenantId } from '../../../../lib/tenant';
import { DataService } from '../../../../lib/data-service';

export async function GET(request: Request) {
  try {
    const tenantId = await getTenantId();
    const service = new DataService(tenantId);
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || new Date().toISOString();
    const events = await service.getEvents(from);
    return NextResponse.json(events);
  } catch (error: any) {
    if (error.message && error.message.includes('Account not found')) {
      // User is not connected, gracefully ignore
    } else {
      console.error('Error fetching events:', error);
    }
    return NextResponse.json([]);
  }
}
