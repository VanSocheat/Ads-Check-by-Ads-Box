import { NextResponse } from 'next/server';
import { loginUrl } from '@/lib/meta';
import crypto from 'crypto';

export async function GET() {
  const state = crypto.randomBytes(16).toString('hex');
  const res = NextResponse.redirect(loginUrl(state));
  res.cookies.set('oauth_state', state, { httpOnly: true, maxAge: 600, path: '/' });
  return res;
}
