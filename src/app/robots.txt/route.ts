import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const txt = `User-agent: *\nAllow: /\nSitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml`;
  return new NextResponse(txt, { headers: { 'Content-Type': 'text/plain' } });
}
