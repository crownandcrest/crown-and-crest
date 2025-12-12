import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

export const revalidate = 0; // ⚠️ Set to 0 to ensure fresh data during development

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  // 1. Fetch New Arrivals (Latest 4)
  const { data: newArrivals, error: newError } = await supabase
    .from("products")
    .select(`
      *,
      product_variants (
        selling_price
      )
    `)
    .order('created_at', { ascending: false })
    .limit(4);

  if (newError) console.error("New Arrivals Error:", newError);

  // 2. Fetch Top Selling (For now, just fetching 4 oldest products as placeholders)
  // In the future, you can sort this by number of orders
  const { data: topSelling, error: topError } = await supabase
    .from("products")
    .select(`
      *,
      product_variants (
        selling_price
      )
    `)
    .limit(4);

  if (topError) console.error("Top Selling Error:", topError);

  // Helper to safely get price
  const getPrice = (product: any) => {
    if (product.product_variants && product.product_variants.length > 0) {
        return Number(product.product_variants[0].selling_price) || 0;
    }
    return 0; 
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Crown & Crest",
    "url": "https://crownandcrest.com",
    "logo": "https://crownandcrest.com/logo.png",
    "sameAs": ["https://twitter.com/crownandcrest", "https://instagram.com/crownandcrest"]
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* --- HERO SECTION --- */}
      <section className="bg-[#F2F0F1] pt-10 md:pt-20 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            <div className="z-10 relative pb-10 lg:pb-20">
                <h1 className="text-5xl md:text-7xl font-black text-black leading-[0.9] mb-6 font-display uppercase">
                    Find Clothes <br/> That Matches <br/> Your Style
                </h1>
                <p className="text-gray-500 text-base mb-8 max-w-md leading-relaxed">
                    Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.
                </p>
                <Link href="/shop" className="inline-block bg-black text-white px-12 py-4 rounded-full font-medium text-lg hover:bg-gray-800 transition shadow-xl">
                    Shop Now
                </Link>

                <div className="flex flex-wrap gap-8 mt-12">
                    <div className="border-r border-gray-300 pr-6">
                        <h3 className="text-3xl font-bold text-black">200+</h3>
                        <p className="text-xs text-gray-500">International Brands</p>
                    </div>
                    <div className="border-r border-gray-300 pr-6">
                        <h3 className="text-3xl font-bold text-black">2,000+</h3>
                        <p className="text-xs text-gray-500">High-Quality Products</p>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-black">30,000+</h3>
                        <p className="text-xs text-gray-500">Happy Customers</p>
                    </div>
                </div>
            </div>

            {/* Hero Image */}
            <div className="relative h-[500px] lg:h-[700px] w-full">
               <Image 
                 src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=800&q=80"
                 alt="Models"
                 fill
                 className="object-cover object-top lg:object-contain mix-blend-multiply"
                 priority
               />
               <div className="absolute top-1/2 right-0 text-4xl animate-bounce">✨</div>
               <div className="absolute top-1/4 left-10 text-4xl animate-pulse delay-700">✨</div>
            </div>
        </div>
      </section>

      {/* --- BRAND STRIP --- */}
      <div className="bg-black py-8">
        <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-8 opacity-70 grayscale">
            <span className="text-2xl md:text-3xl font-black text-white font-display">VERSACE</span>
            <span className="text-2xl md:text-3xl font-black text-white font-display">ZARA</span>
            <span className="text-2xl md:text-3xl font-black text-white font-display">GUCCI</span>
            <span className="text-2xl md:text-3xl font-black text-white font-display">PRADA</span>
            <span className="text-2xl md:text-3xl font-black text-white font-display">Calvin Klein</span>
        </div>
      </div>

      {/* --- NEW ARRIVALS --- */}
      <section className="py-16 md:py-24 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-12 uppercase font-display">New Arrivals</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 text-left">
                {newArrivals?.map((product) => (
                    <ProductCard 
                        key={product.id}
                        id={product.id}
                        name={product.name || "Unnamed Product"} 
                        price={getPrice(product)}
                        rating={4.5}
                        image={product.images?.[0] || ""}
                        discount={0}
                    />
                ))}
            </div>

            <div className="mt-12 text-center">
                <Link href="/shop" className="inline-block px-12 py-3 border border-gray-200 rounded-full text-black font-medium hover:bg-black hover:text-white transition">
                    View All
                </Link>
            </div>
        </div>
      </section>

      {/* --- TOP SELLING (Now Added!) --- */}
      <section className="py-16 md:py-24 border-b border-gray-100">
        <div className="container mx-auto px-4 md:px-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-12 uppercase font-display">Top Selling</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 text-left">
                {topSelling?.map((product) => (
                    <ProductCard 
                        key={product.id}
                        id={product.id}
                        name={product.name || "Unnamed Product"} 
                        price={getPrice(product)}
                        rating={5.0}
                        image={product.images?.[0] || ""}
                        discount={20}
                    />
                ))}
            </div>

            <div className="mt-12 text-center">
                <Link href="/shop" className="inline-block px-12 py-3 border border-gray-200 rounded-full text-black font-medium hover:bg-black hover:text-white transition">
                    View All
                </Link>
            </div>
        </div>
      </section>

      {/* --- BROWSE BY STYLE --- */}
      <section className="py-12 px-4 md:px-10">
        <div className="container mx-auto bg-[#F0F0F0] rounded-[40px] py-16 px-6 md:px-16 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-12 uppercase font-display">Browse By Dress Style</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
                <Link href="/shop?category=Casual" className="relative group bg-white rounded-[20px] overflow-hidden md:col-span-1 h-[250px] md:h-auto">
                    <h3 className="absolute top-6 left-6 text-3xl font-bold text-black z-10">Casual</h3>
                    <Image src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600" alt="Casual" fill className="object-cover group-hover:scale-110 transition duration-500" />
                </Link>
                <Link href="/shop?category=Formal" className="relative group bg-white rounded-[20px] overflow-hidden md:col-span-2 h-[250px] md:h-auto">
                    <h3 className="absolute top-6 left-6 text-3xl font-bold text-black z-10">Formal</h3>
                    <Image src="https://images.unsplash.com/photo-1593030761757-71bd90dbe3e4?auto=format&fit=crop&w=800" alt="Formal" fill className="object-cover group-hover:scale-110 transition duration-500" />
                </Link>
                <Link href="/shop?category=Party" className="relative group bg-white rounded-[20px] overflow-hidden md:col-span-2 h-[250px] md:h-auto">
                    <h3 className="absolute top-6 left-6 text-3xl font-bold text-black z-10">Party</h3>
                    <Image src="https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800" alt="Party" fill className="object-cover group-hover:scale-110 transition duration-500" />
                </Link>
                <Link href="/shop?category=Gym" className="relative group bg-white rounded-[20px] overflow-hidden md:col-span-1 h-[250px] md:h-auto">
                    <h3 className="absolute top-6 left-6 text-3xl font-bold text-black z-10">Gym</h3>
                    <Image src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=600" alt="Gym" fill className="object-cover group-hover:scale-110 transition duration-500" />
                </Link>
            </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-10">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-4xl md:text-5xl font-black text-black uppercase font-display">Our Happy Customers</h2>
                <div className="hidden md:flex gap-2">
                    <button className="p-2 rounded-full hover:bg-gray-100"><ArrowRight className="rotate-180 w-6 h-6" /></button>
                    <button className="p-2 rounded-full hover:bg-gray-100"><ArrowRight className="w-6 h-6" /></button>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory">
                {[
                    { name: "Sarah M.", text: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece has exceeded my expectations." },
                    { name: "Alex K.", text: "Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable." },
                    { name: "James L.", text: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point." },
                    { name: "Mooen", text: "The fit is perfect and the quality is amazing. I will definitely be buying more from here!" }
                ].map((review, idx) => (
                    <div key={idx} className="min-w-[300px] md:min-w-[400px] p-8 border border-gray-200 rounded-[20px] snap-center">
                        <div className="flex text-yellow-400 mb-4 gap-1">
                            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                        </div>
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                            {review.name} <CheckCircle className="w-5 h-5 text-green-500 fill-green-100" />
                        </h4>
                        <p className="text-gray-500 text-sm leading-relaxed">"{review.text}"</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

    </div>
  );
}