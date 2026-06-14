import { NextResponse } from 'next/server';
import { corsair } from '../../../lib/corsair';
import { getTenantId } from '../../../lib/tenant';

export async function GET() {
  try {
    const tenantId = await getTenantId();
    const tenant = corsair.withTenant(tenantId);

    let gmailConnected = false;
    try {
      const token = await tenant.gmail.keys.get_refresh_token();
      gmailConnected = !!token;
    } catch (e) {}

    let calendarConnected = false;
    try {
      const token = await tenant.googlecalendar.keys.get_refresh_token();
      calendarConnected = !!token;
    } catch (e) {}

    return NextResponse.json({
      tenantId,
      gmailConnected,
      calendarConnected
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
