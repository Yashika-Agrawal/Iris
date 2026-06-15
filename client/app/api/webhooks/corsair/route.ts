import { NextResponse } from 'next/server';
import { corsair } from '../../../../lib/corsair';
import { processWebhook } from 'corsair';
import { getTenantId } from '../../../../lib/tenant';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const headers = Object.fromEntries(req.headers.entries());
    const tenantId = await getTenantId();

    console.log('Received Corsair webhook headers/body for tenant:', tenantId);

    // Call Corsair's processWebhook function exactly as shown in the video
    try {
      await processWebhook({
        corsair,
        headers,
        body,
        tenantId
      });
    } catch (e) {
      console.error('processWebhook error:', e);
    }

    // Notify all connected SSE clients to refresh instantly
    const globalAny = global as any;
    if (globalAny.sseClients) {
      globalAny.sseClients.forEach((client: any) => {
        try {
          client();
        } catch (e) {
          console.error('Failed to notify SSE client');
        }
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
