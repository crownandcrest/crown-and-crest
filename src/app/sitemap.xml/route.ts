import { supabase } from "@/lib/supabase"; // <--- Use the correct import
import { Product } from "@/types";

const URL = "https://crownandcrest.com"; // Replace with your actual domain

export async function GET() {
  // Fetch all products to create dynamic routes
  const { data: productsData } = await supabase.from("products").select("slug, updated_at");
  const products: Partial<Product>[] = productsData || [];

  const productUrls =
    products?.map((product: Partial<Product>) => {
      return `
       <url>
           <loc>${URL}/product/${product.slug}</loc>
           <lastmod>${new Date(product.updated_at || Date.now()).toISOString()}</lastmod>
           <changefreq>daily</changefreq>
           <priority>0.8</priority>
       </url>
     `;
    })
    .join("") || "";

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${URL}</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${URL}/shop</loc>
       <lastmod>${new Date().toISOString()}</lastmod>
       <changefreq>daily</changefreq>
       <priority>0.9</priority>
     </url>
     ${productUrls}
   </urlset>
 `;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "text/xml",
    },
  });
}