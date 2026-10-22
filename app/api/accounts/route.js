import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAccounts } from '@/lib/meta';

export async function GET() {
  const token = cookies().get('meta_token')?.value;
  if (!token) return NextResponse.json({ error: 'not_connected' }, { status: 401 });
  try {
    return NextResponse.json({ accounts: await getAccounts(token) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
