/**
 * Sitemap generation for SEO
 * Route to: /sitemap.xml
 */

import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  // Fetch published products only
  const { data: products, error } = await supabaseServer
    .from('products')
    .select('slug, updated_at, created_at')
    .eq('published', true)
    .eq('active', true)

  if (error) {
    return new Response('Internal Server Error', { status: 500 })
  }

  const baseUrl = 'https://crownandcrest.com'

  // Build sitemap entries
  const entries: Array<{ loc: string; lastmod?: string; priority: number }> = [
    // Static pages
    { loc: baseUrl, priority: 1.0 },
    { loc: `${baseUrl}/shop`, priority: 0.9 },

    // Dynamic product pages
    ...(products?.map((product) => ({
      loc: `${baseUrl}/product/${product.slug}`,
      lastmod: (product.updated_at || product.created_at)?.split('T')[0],
      priority: 0.8,
    })) ?? []),
  ]

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
