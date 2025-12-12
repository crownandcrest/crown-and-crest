// src/app/admin/customers/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Search, Mail, Phone, Ruler, User as UserIcon } from 'lucide-react';
import { Profile, Order, MeasurementProfile } from '@/types';

interface CustomerStat extends Profile {
    orderCount: number;
    totalSpent: number;
    lastOrder: string | null;
    hasSizeProfile: boolean;
}

export default async function CustomersPage() {
    const supabase = await createServerSupabaseClient();

    // 1. Fetch Profiles, Orders, and Measurements in parallel
    const [
        { data: profilesData },
        { data: ordersData },
        { data: measurementsData }
    ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('user_id, total_amount, created_at'),
        supabase.from('user_measurements').select('user_id')
    ]);

    const profiles: Profile[] = profilesData || [];
    const orders: Partial<Order>[] = ordersData || [];
    const measurements: Partial<MeasurementProfile>[] = measurementsData || [];

    // 2. Process Data: Calculate LTV (Lifetime Value) per user
    const customerStats: CustomerStat[] = profiles.map(profile => {
        // Filter orders belonging to this user
        const userOrders = orders.filter(o => o.user_id === profile.id) || [];
        
        // Calculate Total Spent
        const totalSpent = userOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        
        // Check if they have a Size Profile
        const hasSizeProfile = measurements.some(m => m.user_id === profile.id);

        return {
            ...profile,
            orderCount: userOrders.length,
            totalSpent,
            lastOrder: userOrders.length > 0 ? userOrders[0].created_at : null, // Assumes orders sorted desc
            hasSizeProfile
        };
    }) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                <p className="text-gray-500 text-sm">View your user base and their lifetime value</p>
            </div>

            {/* Search Bar (Visual) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search by email or phone..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4 text-center">Size Profile</th>
                                <th className="px-6 py-4 text-right">Orders</th>
                                <th className="px-6 py-4 text-right">Total Spent</th>
                                <th className="px-6 py-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {customerStats.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <UserIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">User</p>
                                                <p className="text-xs font-mono text-gray-400">{customer.id.slice(0, 6)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 space-y-1">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail className="w-3 h-3" /> {customer.email || 'No Email'}
                                        </div>
                                        {customer.mobile_number && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="w-3 h-3" /> {customer.mobile_number}
                                                {customer.is_mobile_verified && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-1.5 rounded">Verified</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {customer.hasSizeProfile ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                <Ruler className="w-3 h-3" /> Active
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium">
                                        {customer.orderCount}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-bold ${customer.totalSpent > 100 ? 'text-green-600' : 'text-gray-900'}`}>
                                            ₹{customer.totalSpent.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(customer.created_at || Date.now()).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}

                            {customerStats.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}