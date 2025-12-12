"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link"; // 👈 Import Link
import { 
    Package, User as UserIcon, MapPin, LogOut, Loader2, 
    ChevronRight, Ruler, Plus, Trash2, Home 
} from "lucide-react";
import { User } from "@supabase/supabase-js";

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    items?: any[];
}

interface Address {
    id: string;
    full_name: string;
    phone: string;
    street: string;
    city: string;
    zip: string;
    is_default: boolean;
}

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "addresses">("orders");
  
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "", phone: "", street: "", city: "", zip: "", is_default: false
  });

  const [profile, setProfile] = useState({ full_name: "", phone: "", email: "" });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);

      // 1. Fetch Profile
      const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      if (profileData) setProfile({ full_name: profileData.full_name || "", phone: profileData.phone || "", email: user.email || "" });

      // 2. Fetch Orders (Exclude drafts)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'pending_payment') // Hide failed/draft orders
        .order('created_at', { ascending: false });
        
      if (ordersData) setOrders(ordersData as Order[]);

      // 3. Fetch Addresses
      fetchAddresses(user.id);
      
      setLoading(false);
    };
    init();
  }, [router]);

  const fetchAddresses = async (userId: string) => {
      const { data } = await supabase.from('user_addresses').select('*').eq('user_id', userId).order('is_default', { ascending: false });
      if (data) setAddresses(data as Address[]);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;

      if (newAddress.is_default || addresses.length === 0) {
          await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id);
      }

      const { error } = await supabase.from('user_addresses').insert({
          user_id: user.id,
          ...newAddress,
          is_default: addresses.length === 0 ? true : newAddress.is_default 
      });

      if (error) alert(error.message);
      else {
          setIsAddingAddress(false);
          setNewAddress({ full_name: "", phone: "", street: "", city: "", zip: "", is_default: false });
          fetchAddresses(user.id);
      }
  };

  const deleteAddress = async (id: string) => {
      if(!confirm("Delete this address?")) return;
      await supabase.from('user_addresses').delete().eq('id', id);
      fetchAddresses(user?.id || "");
  };

  const setDefaultAddress = async (id: string) => {
      if (!user) return;
      await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id);
      await supabase.from('user_addresses').update({ is_default: true }).eq('id', id);
      fetchAddresses(user.id);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/"); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 md:px-10 py-10 min-h-[80vh]">
      <h1 className="text-3xl font-black uppercase font-display mb-8">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-[280px] lg:w-[320px] flex-shrink-0 bg-white border border-gray-200 rounded-[20px] p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-8">
                <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold uppercase">{profile.full_name?.[0] || "U"}</div>
                <div className="overflow-hidden"><h3 className="font-bold truncate">{profile.full_name || "User"}</h3><p className="text-xs text-gray-500 truncate">{user?.email}</p></div>
            </div>
            <nav className="flex flex-col gap-2">
                <button onClick={() => setActiveTab("orders")} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${activeTab === "orders" ? "bg-black text-white" : "hover:bg-gray-50 text-gray-600"}`}><Package className="w-5 h-5" /> My Orders</button>
                <button onClick={() => setActiveTab("addresses")} className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium transition-all ${activeTab === "addresses" ? "bg-black text-white" : "hover:bg-gray-50 text-gray-600"}`}><MapPin className="w-5 h-5" /> Address Book</button>
                <button onClick={() => router.push("/account/size-book")} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 font-medium hover:bg-indigo-50 text-gray-600 hover:text-indigo-600"><Ruler className="w-5 h-5" /> Size Book <ChevronRight className="w-4 h-4 ml-auto" /></button>
                <div className="border-t border-gray-100 my-2"></div>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 text-red-500 hover:bg-red-50 font-medium"><LogOut className="w-5 h-5" /> Logout</button>
            </nav>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 w-full min-h-[500px]">
            
            {/* TAB: ORDERS */}
            {activeTab === "orders" && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Order History</h2>
                    {orders.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-[20px]">
                            <p className="text-gray-500 mb-4">No orders yet.</p>
                            <button onClick={() => router.push('/shop')} className="bg-black text-white px-6 py-2 rounded-full font-bold">Shop Now</button>
                        </div>
                    ) : orders.map(order => (
                        <Link 
                            key={order.id} 
                            href={`/account/orders/${order.id}`} // 👈 LINK ADDED HERE
                            className="block border border-gray-200 rounded-[20px] p-6 bg-white hover:border-black hover:shadow-md transition group"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold flex items-center gap-2">
                                        Order #{order.id.slice(0,8)} 
                                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-black transition" />
                                    </p>
                                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₹{order.total_amount.toLocaleString()}</p>
                                    <span className={`text-xs px-2 py-1 rounded capitalize ${
                                        order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {order.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* TAB: ADDRESS BOOK */}
            {activeTab === "addresses" && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Address Book</h2>
                        <button onClick={() => setIsAddingAddress(!isAddingAddress)} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-800">
                            <Plus className="w-4 h-4" /> Add New
                        </button>
                    </div>

                    {isAddingAddress && (
                        <form onSubmit={handleSaveAddress} className="bg-gray-50 p-6 rounded-[20px] mb-8 border border-gray-200 animate-in fade-in">
                            <h3 className="font-bold mb-4">New Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input required placeholder="Full Name" className="p-3 rounded-xl border" value={newAddress.full_name} onChange={e => setNewAddress({...newAddress, full_name: e.target.value})} />
                                <input required placeholder="Phone Number" className="p-3 rounded-xl border" value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} />
                            </div>
                            <input required placeholder="Street Address / Flat / Area" className="w-full p-3 rounded-xl border mb-4" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <input required placeholder="City" className="p-3 rounded-xl border" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                                <input required placeholder="Zip Code" className="p-3 rounded-xl border" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
                            </div>
                            <div className="flex items-center gap-2 mb-6">
                                <input type="checkbox" id="def" checked={newAddress.is_default} onChange={e => setNewAddress({...newAddress, is_default: e.target.checked})} />
                                <label htmlFor="def" className="text-sm font-medium">Set as default address</label>
                            </div>
                            <button type="submit" className="bg-black text-white px-6 py-3 rounded-xl font-bold w-full">Save Address</button>
                        </form>
                    )}

                    <div className="grid gap-4">
                        {addresses.map((addr) => (
                            <div key={addr.id} className={`p-6 rounded-[20px] border-2 transition flex justify-between items-start ${addr.is_default ? 'border-black bg-gray-50' : 'border-gray-100 bg-white'}`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Home className="w-5 h-5" />
                                        <h3 className="font-bold text-lg">{addr.full_name}</h3>
                                        {addr.is_default && <span className="bg-black text-white text-[10px] px-2 py-1 rounded-full uppercase font-bold">Default</span>}
                                    </div>
                                    <p className="text-gray-600">{addr.street}</p>
                                    <p className="text-gray-600">{addr.city}, {addr.zip}</p>
                                    <p className="text-gray-500 text-sm mt-2">📞 {addr.phone}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {!addr.is_default && (
                                        <button onClick={() => setDefaultAddress(addr.id)} className="text-xs font-bold text-indigo-600 hover:underline">Set Default</button>
                                    )}
                                    <button onClick={() => deleteAddress(addr.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
