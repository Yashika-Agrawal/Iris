import { NextResponse } from 'next/server';
import { corsair } from '../../../../lib/corsair';
import { getTenantId } from '../../../../lib/tenant';
import { CalEvent } from '../../../../types';

export async function GET(request: Request) {
  try {
    const tenantId = await getTenantId();
    const tenant = corsair.withTenant(tenantId);
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || new Date().toISOString();
    
    const response = await tenant.googlecalendar.api.events.getMany({
      timeMin: from,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const items = response.items || [];
    const formatted: CalEvent[] = items.map((item: any) => {
      const guests = item.attendees?.map((a: any) => a.email || a.displayName || '').filter(Boolean) || [];
      return {
        id: item.id || '',
        title: item.summary || 'Untitled Event',
        start: item.start?.dateTime || item.start?.date || '',
        end: item.end?.dateTime || item.end?.date || '',
        guests,
        description: item.description || ''
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching events:', error);
    const mockEvents: CalEvent[] = [
      {
        id: 'event-1',
        title: 'Mentor review',
        start: new Date(Date.now() + 1000 * 60 * 40).toISOString(),
        end: new Date(Date.now() + 1000 * 60 * 100).toISOString(),
        guests: ['Piyush Garg', 'Rohan Sharma', 'Yashika Agrawal'],
        description: 'Weekly mentor review and hackathon checkin.'
      },
      {
        id: 'event-2',
        title: 'Project Demo Pitch',
        start: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        end: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(),
        guests: ['Piyush Garg', 'Yashika Agrawal'],
        description: 'Demoing Iris to the Corsair team.'
      }
    ];
    return NextResponse.json(mockEvents);
  }
}
