import { NextResponse } from 'next/server';
import { exchangeCode } from '@/lib/meta';

export async function GET(req) {
  const u = new URL(req.url);
  const code = u.searchParams.get('code');
  const state = u.searchParams.get('state');
  const saved = req.cookies.get('oauth_state')?.value;
  if (!code || !state || state !== saved) return NextResponse.redirect(`${process.env.APP_URL}/?error=login`);
  const token = await exchangeCode(code);
  const res = NextResponse.redirect(process.env.APP_URL);
  // Starter: token in httpOnly cookie. For production store it ENCRYPTED in a database.
  res.cookies.set('meta_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 24 * 3600, path: '/' });
  res.cookies.delete('oauth_state');
  return res;
}
