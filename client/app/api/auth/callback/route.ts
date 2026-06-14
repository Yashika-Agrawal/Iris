import { NextResponse } from 'next/server';
import { corsair } from '../../../../lib/corsair';
import { processOAuthCallback } from 'corsair/oauth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      throw new Error('Missing OAuth code or state parameter');
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/callback`;

    const result = await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri
    });

    console.log(`Successfully connected ${result.plugin} for tenant ${result.tenantId}`);

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?connected=${result.plugin}`);
  } catch (error: any) {
    console.error('Failed to handle OAuth callback:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?error=${encodeURIComponent(error.message)}`);
  }
}
