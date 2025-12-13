import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/admin/Sidebar';
import { Search, Bell, Settings } from 'lucide-react';

// --- Header Component ---
const Header = () => {
    return (
        <header className="sticky top-0 h-16 w-full bg-white shadow-sm flex items-center justify-between px-8 z-20 border-b border-gray-200">
             {/* Left Spacer */}
            <div className="flex-1 hidden lg:block"></div>

            {/* Center: Search Bar */}
            <div className="flex-1 max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="search"
                    placeholder="Search Dashboard"
                    className="w-full py-2 pl-10 pr-4 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
            </div>

            {/* Right: Icons and User Profile */}
            <div className="flex-1 flex justify-end items-center space-x-4">
                <button className="text-gray-500 hover:text-indigo-600 p-2 rounded-full transition duration-150 relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <div className="flex items-center space-x-2 border-l pl-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition duration-150">
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">A</div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:inline">Admin</span>
                </div>
            </div>
        </header>
    )
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabase = await createServerSupabaseClient();
    
    // 1. Get the current User
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login'); 
    }

    // 2. CHECK ADMIN STATUS (Fixed Logic)
    // We check the 'profiles' table, not 'admins'
    const { data: profile, error } = await supabase
        .from('profiles') 
        .select('role') 
        .eq('id', user.id) 
        .single();
    
    // 3. Security Gate
    // If there is an error, no profile, or the role is NOT 'admin', kick them out.
    if (error || !profile || profile.role !== 'admin') {
        console.error("Access Denied: User is not an admin."); 
        redirect('/'); 
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col w-full">
                <Header /> 
                <main className="p-8 w-full">
                    <div className="w-full max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}