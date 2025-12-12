// src/app/admin/page.tsx
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Package, DollarSign, Users, Eye, LucideIcon } from 'lucide-react';
import { RevenueChart, DevicesChart } from '@/components/admin/DashboardCharts'; 
import { Order, Analytics, MeasurementProfile } from '@/types';

// --- Interfaces ---
interface KpiCardProps {
    title: string;
    value: string | number;
    change: string;
    icon: LucideIcon;
    colorClass: string;
}

// --- Helper Component ---
const KpiCard = ({ title, value, change, icon: Icon, colorClass }: KpiCardProps) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
            <span className={`text-xs font-medium ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {change} from last month
            </span>
        </div>
        <div className={`p-3 rounded-full ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
    </div>
);

export default async function DashboardPage() {
    const supabase = await createServerSupabaseClient();

    // --- Data Fetching ---
    // We use Promise.all to fetch everything in parallel
    const [
        { count: productCount },
        { count: orderCount, data: rawOrders },
        { count: viewCount, data: rawAnalytics },
        { count: userCount }
    ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total_amount, created_at, status'), // Include ID
        supabase.from('analytics').select('device_type, country, created_at', { count: 'exact' }),
        supabase.from('user_measurements').select('*', { count: 'exact', head: true })
    ]);

    const orders: Partial<Order>[] | null = rawOrders;
    const analytics: Partial<Analytics>[] | null = rawAnalytics;

    // --- Data Processing ---
    
    // 1. Calculate Total Revenue
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // 2. Process "Revenue Chart" (Group by Month)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const paymentsMap: Array<{ name: string; received: number; }> = new Array(12).fill(0).map((_, i) => ({ name: months[i], received: 0 }));
    
    orders?.forEach(order => {
        const date = new Date(order.created_at);
        const monthIndex = date.getMonth();
        if (paymentsMap[monthIndex]) {
            paymentsMap[monthIndex].received += order.total_amount;
        }
    });

    // 3. Process "Devices Chart" (Group by Device Type)
    const deviceStats: Record<string, number> = {};
    analytics?.forEach(entry => {
        const device = entry.device_type || 'Unknown';
        deviceStats[device] = (deviceStats[device] || 0) + 1;
    });
    
    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];
    const deviceData: Array<{ name: string; value: number; color: string; }> = Object.keys(deviceStats).map((key, index) => ({
        name: key,
        value: deviceStats[key],
        color: COLORS[index % COLORS.length]
    }));

    const totalVisitors = viewCount || 0;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mb-6">Real-time Overview of Crown & Crest</p>

            {/* 1. KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Views" value={viewCount || 0} change="+12%" icon={Eye} colorClass="bg-green-500" />
                <KpiCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} change="+8%" icon={DollarSign} colorClass="bg-orange-500" />
                <KpiCard title="Total Products" value={productCount || 0} change="+2%" icon={Package} colorClass="bg-indigo-500" />
                <KpiCard title="Total Users" value={userCount || 0} change="+5%" icon={Users} colorClass="bg-blue-500" />
            </div>

            {/* 2. CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Revenue Overview (Line Chart) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Revenue Overview (Yearly)</h2>
                    <RevenueChart data={paymentsMap} />
                </div>

                {/* Used Devices (Doughnut Chart) */}
                <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Used Devices</h2>
                    <DevicesChart data={deviceData} totalVisitors={totalVisitors} />
                </div>
            </div>

            {/* 3. RECENT ORDERS TABLE */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">Order ID</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Amount</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {orders && orders.length > 0 ? (
                                orders.slice(0, 5).map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-medium text-indigo-600 truncate max-w-[100px]">
                                            #{order.id?.slice(0,8)}
                                        </td>
                                        <td className="px-6 py-4">{new Date(order.created_at!).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-semibold">${order.total_amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs 
                                                ${order.status === 'shipped' ? 'bg-green-100 text-green-700' : 
                                                  order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-700' : 
                                                  'bg-blue-100 text-blue-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                        No recent orders found.
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