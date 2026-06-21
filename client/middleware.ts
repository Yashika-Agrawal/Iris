import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Check if the user already has a tenant ID
  let tenantId = request.cookies.get('tenant-id')?.value;
  
  // If not, generate a unique random ID and set the cookie
  if (!tenantId) {
    tenantId = crypto.randomUUID();
    response.cookies.set('tenant-id', tenantId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false, // allow client side reading
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
