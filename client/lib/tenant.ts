import { cookies } from 'next/headers';

export async function getTenantId(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const tenantCookie = cookieStore.get('tenant-id');
    return tenantCookie?.value || 'default_tenant';
  } catch (e) {
    return 'default_tenant';
  }
}
