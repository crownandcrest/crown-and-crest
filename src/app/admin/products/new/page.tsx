"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Save, ArrowLeft, UploadCloud, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { uploadToCloudinary } from "@/lib/cloudinary"; // 👈 IMPORT THIS

export default function NewProductPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false); // 👈 New state for upload spinner
    const [sizeCharts, setSizeCharts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "Men",
        price: "",
        cost_price: "",
        stock: "",
        images: [] as string[],
        size_chart_id: ""
    });

    useEffect(() => {
        const fetchCharts = async () => {
            const { data } = await supabase.from('size_charts').select('id, name');
            if (data) setSizeCharts(data);
        };
        fetchCharts();
    }, []);

    // 🛠️ FIXED UPLOAD FUNCTION
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        setUploading(true); // Start spinner
        try {
            const file = e.target.files[0];
            const url = await uploadToCloudinary(file); // 👈 Use Cloudinary Helper
            
            setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
        } catch (error) {
            console.error(error);
            alert("Upload failed. Check console for details.");
        } finally {
            setUploading(false); // Stop spinner
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data: product, error } = await supabase.from('products').insert({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            images: formData.images,
            size_chart_id: formData.size_chart_id || null
        }).select().single();

        if (error) {
            alert(error.message);
            setLoading(false);
            return;
        }

        const sizes = ["S", "M", "L", "XL"];
        const variants = sizes.map(size => ({
            product_id: product.id,
            size: size,
            color: "Black",
            stock_quantity: Number(formData.stock),
            selling_price: Number(formData.price),
            cost_price: Number(formData.cost_price)
        }));

        const { error: variantError } = await supabase.from('product_variants').insert(variants);

        if (variantError) {
            alert("Product created but variants failed: " + variantError.message);
        } else {
            router.push("/admin/products");
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-6">
            <Link href="/admin/products" className="inline-flex items-center text-gray-500 hover:text-black mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
            </Link>

            <h1 className="text-3xl font-black mb-8">Add New Product</h1>

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
                </div >

                {/* IMAGES */}
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
                        <label className={`aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-black transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {uploading ? <Loader2 className="animate-spin text-gray-400" /> : <UploadCloud className="w-8 h-8 text-gray-400" />}
                            <span className="text-xs font-bold text-gray-500 mt-2">{uploading ? "Uploading..." : "Upload Image"}</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
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
                </div>

                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={loading || uploading} className="bg-black text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-gray-800 transition shadow-xl disabled:opacity-50">
                        {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                        Create Product
                    </button>
                </div>
            </form>
        </div>
    );
}