"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { Loader2, Save, ArrowLeft, UploadCloud, X, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function EditProductPage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sizeCharts, setSizeCharts] = useState<any[]>([]); // 👈 Store charts

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "Men",
        price: "",
        cost_price: "",
        stock: "",
        images: [] as string[],
        size_chart_id: "" // 👈 Added field
    });

    // 1. Fetch Product Data & Size Charts
    useEffect(() => {
        const init = async () => {
            // Fetch available charts
            const { data: charts } = await supabase.from('size_charts').select('id, name');
            if (charts) setSizeCharts(charts);

            // Fetch product details
            const { data: product, error } = await supabase
                .from('products')
                .select(`
                    *,
                    product_variants (
                        selling_price,
                        cost_price,
                        stock_quantity
                    )
                `)
                .eq('id', id)
                .single();

            if (error || !product) {
                alert("Product not found");
                router.push("/admin/products");
                return;
            }

            // Populate Form
            // We take price/stock from the first variant as a simplified edit view
            const mainVariant = product.product_variants?.[0] || {};
            
            setFormData({
                name: product.name,
                description: product.description || "",
                category: product.category || "Men",
                images: product.images || [],
                size_chart_id: product.size_chart_id || "", // 👈 Load existing chart
                price: mainVariant.selling_price || "",
                cost_price: mainVariant.cost_price || "",
                stock: mainVariant.stock_quantity || ""
            });
            setLoading(false);
        };

        init();
    }, [id, router]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setSaving(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
        if (uploadError) {
            alert("Upload failed: " + uploadError.message);
            setSaving(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filePath);
        setFormData(prev => ({ ...prev, images: [...prev.images, publicUrl] }));
        setSaving(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        // 1. Update Product Info
        const { error } = await supabase.from('products').update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            images: formData.images,
            size_chart_id: formData.size_chart_id || null // 👈 Update link
        }).eq('id', id);

        if (error) {
            alert(error.message);
            setSaving(false);
            return;
        }

        // 2. Update All Variants (Simplified: Update all variants to match these prices)
        // In a real complex app, you might edit variants individually.
        const { error: variantError } = await supabase
            .from('product_variants')
            .update({
                stock_quantity: Number(formData.stock),
                selling_price: Number(formData.price),
                cost_price: Number(formData.cost_price)
            })
            .eq('product_id', id);

        if (variantError) {
            alert("Updated product but failed to update variants: " + variantError.message);
        } else {
            alert("Product Updated Successfully!");
            router.push("/admin/products");
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        if(!confirm("Are you sure? This will delete the product and all variants.")) return;
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) router.push("/admin/products");
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <div className="flex justify-between items-center mb-6">
                <Link href="/admin/products" className="inline-flex items-center text-gray-500 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
                </Link>
                <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete Product
                </button>
            </div>

            <h1 className="text-3xl font-black mb-8">Edit Product</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* BASIC INFO */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Basic Information</h3>
                    <div className="grid gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Product Name</label>
                            <input required className="w-full p-3 border rounded-xl" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Description</label>
                            <textarea required rows={4} className="w-full p-3 border rounded-xl" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                                <select className="w-full p-3 border rounded-xl bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option value="Men">Men</option>
                                    <option value="Women">Women</option>
                                    <option value="Accessories">Accessories</option>
                                </select>
                            </div>

                            {/* 👇 NEW: SIZE CHART SELECTOR 👇 */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Size Guide Profile</label>
                                <select 
                                    className="w-full p-3 border rounded-xl bg-white" 
                                    value={formData.size_chart_id} 
                                    onChange={e => setFormData({...formData, size_chart_id: e.target.value})}
                                >
                                    <option value="">-- No Size Guide --</option>
                                    {sizeCharts.map((chart) => (
                                        <option key={chart.id} value={chart.id}>{chart.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* IMAGES (Same as before) */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Product Images</h3>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        {formData.images.map((img, i) => (
                            <div key={i} className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border">
                                <Image src={img} alt="Preview" fill className="object-cover" />
                                <button type="button" onClick={() => setFormData(p => ({...p, images: p.images.filter((_, idx) => idx !== i)}))} className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-red-50 text-red-500">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <label className="aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black transition">
                            {saving ? <Loader2 className="animate-spin text-gray-400" /> : <UploadCloud className="w-8 h-8 text-gray-400" />}
                            <span className="text-xs font-bold text-gray-500 mt-2">Upload Image</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={saving} />
                        </label>
                    </div>
                </div>

                {/* PRICING & STOCK */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-lg mb-4">Pricing & Inventory</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Selling Price (₹)</label>
                            <input type="number" required className="w-full p-3 border rounded-xl" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Cost Price (₹)</label>
                            <input type="number" required className="w-full p-3 border rounded-xl" value={formData.cost_price} onChange={e => setFormData({...formData, cost_price: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Total Stock</label>
                            <input type="number" required className="w-full p-3 border rounded-xl" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                        </div>
                    </div>
                    <p className="text-xs text-yellow-600 mt-4 bg-yellow-50 p-3 rounded-lg">
                        ⚠️ Note: Updating these values will apply to ALL size variants (S, M, L, XL) for this product.
                    </p>
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={saving} className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-xl disabled:opacity-50">
                        {saving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
