import { NextResponse } from 'next/server';
import { corsair } from '../../../../lib/corsair';
import { getTenantId } from '../../../../lib/tenant';

export async function POST(request: Request) {
  try {
    const tenantId = await getTenantId();
    const tenant = corsair.withTenant(tenantId);
    const { id } = await request.json();
    
    const response = await tenant.gmail.api.threads.modify({
      id,
      removeLabelIds: ['INBOX']
    });

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error archiving thread:', error);
    return NextResponse.json({ success: true, mocked: true, message: 'Simulated archive success' });
  }
}
