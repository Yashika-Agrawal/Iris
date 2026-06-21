import { NextResponse } from 'next/server';
import { corsair } from '../../../lib/corsair';
import { getTenantId } from '../../../lib/tenant';

export async function GET() {
  try {
    const tenantId = await getTenantId();
    const tenant = corsair.withTenant(tenantId);

    let gmailConnected = false;
    let userEmail = null;
    try {
      const token = await tenant.gmail.keys.get_refresh_token();
      if (token) {
        gmailConnected = true;
        const accessToken = await tenant.gmail.keys.get_access_token();
        if (accessToken) {
          const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (profileRes.ok) {
            const profile = await profileRes.json();
            userEmail = profile.emailAddress;
          }
        }
      }
    } catch (e) {}

    let calendarConnected = false;
    try {
      const token = await tenant.googlecalendar.keys.get_refresh_token();
      calendarConnected = !!token;
    } catch (e) {}

    return NextResponse.json({
      tenantId,
      gmailConnected,
      calendarConnected,
      userEmail
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
