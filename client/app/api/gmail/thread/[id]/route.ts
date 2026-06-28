import { NextResponse } from 'next/server';
import { getTenantId } from '../../../../../lib/tenant';
import { DataService } from '../../../../../lib/data-service';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await getTenantId();
    const service = new DataService(tenantId);
    const result = await service.getThread(id);

    if (!result) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error fetching thread:`, error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}
