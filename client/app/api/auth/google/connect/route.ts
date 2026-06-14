import { NextResponse } from 'next/server';
import { corsair } from '../../../../../lib/corsair';
import { getTenantId } from '../../../../../lib/tenant';
import { generateOAuthUrl } from 'corsair/oauth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plugin = searchParams.get('plugin') || 'gmail';
    const tenantId = await getTenantId();

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`;

    const { url } = await generateOAuthUrl(corsair, plugin, {
      tenantId,
      redirectUri
    });

    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error('Failed to generate OAuth URL:', error);
    return NextResponse.json({ error: error.message || 'Failed to start OAuth flow' }, { status: 500 });
  }
}
