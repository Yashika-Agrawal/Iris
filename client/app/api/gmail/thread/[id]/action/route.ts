import { NextResponse } from 'next/server';
import { corsair } from '../../../../../../lib/corsair';
import { getTenantId } from '../../../../../../lib/tenant';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action } = await request.json();
    const tenantId = await getTenantId();
    const tenant = corsair.withTenant(tenantId);

    if (action === 'archive') {
      await tenant.gmail.api.threads.modify({
        id,
        userId: 'me',
        removeLabelIds: ['INBOX']
      });
      return NextResponse.json({ success: true, action: 'archive' });
    }

    if (action === 'trash') {
      await tenant.gmail.api.threads.trash({
        id,
        userId: 'me'
      });
      return NextResponse.json({ success: true, action: 'trash' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error(`Error performing action on thread:`, error);
    return NextResponse.json({ error: 'Failed to perform action' }, { status: 500 });
  }
}
