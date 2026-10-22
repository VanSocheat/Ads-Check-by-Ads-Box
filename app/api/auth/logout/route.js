import { NextResponse } from 'next/server';
export async function GET() {
  const res = NextResponse.redirect(process.env.APP_URL);
  res.cookies.delete('meta_token');
  return res;
}
