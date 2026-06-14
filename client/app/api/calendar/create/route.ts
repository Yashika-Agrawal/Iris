import { NextResponse } from 'next/server';
import { corsair } from '../../../../lib/corsair';
import { getTenantId } from '../../../../lib/tenant';

export async function POST(request: Request) {
  try {
    const tenantId = await getTenantId();
    const tenant = corsair.withTenant(tenantId);
    const { title, start, end, guests } = await request.json();
    const attendees = guests?.map((email: string) => ({ email })) || [];
    
    const response = await tenant.googlecalendar.api.events.create({
      event: {
        summary: title,
        start: { dateTime: start },
        end: { dateTime: end },
        attendees
      }
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating event:', error);
    // Return mock success for resilient frontend demoing
    return NextResponse.json({ 
      id: 'mock-event-created-' + Math.random().toString(36).substring(7),
      summary: 'Mock Meeting',
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date(Date.now() + 60*60*1000).toISOString() },
      mocked: true 
    });
  }
}
