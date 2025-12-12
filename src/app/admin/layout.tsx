// src/app/admin/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/admin/Sidebar';
import { Search, Bell, Settings } from 'lucide-react';

// NOTE: If you haven't split Header into its own file yet, keep the Header code inside this file as before.

export default async function AdminLayout({ children }: { children: ReactNode }) {
    
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login'); 
    }

    const { data: adminEntry, error: adminError } = await supabase
        .from('admins') 
        .select('*') 
        .eq('user_id', user.id) 
        .single();
    
    if (adminError || !adminEntry) {
        console.error("Access Denied");
        redirect('/'); 
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar is 'sticky', so it sits in the flow naturally */}
            <Sidebar />
            
            {/* ⚠️ FIX: Removed 'ml-64'. 'flex-1' automatically fills the REMAINING space. */}
            <div className="flex-1 flex flex-col w-full">
                
                {/* Your Header Component goes here */}
                <Header /> 
                
                <main className="p-8 w-full">
                    {/* Optional: If you want content centered max-width like the screenshot: */}
                    <div className="w-full max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

// --- Header Component (Keep this here if you haven't moved it) ---
const Header = () => {
    // ... (Your existing Header code) ...
    // Make sure to verify the imports for Bell, Settings, etc. if copying this part
    return (
        <header className="sticky top-0 h-16 w-full bg-white shadow-sm flex items-center justify-between px-8 z-20 border-b border-gray-200">
             {/* Left Spacer / Branding Placeholder */}
            <div className="flex-1 hidden lg:block">
                {/* This area is kept empty to visually center the search bar */}
            </div>

            {/* Center: Search Bar (Clean and Rounded) */}
            <div className="flex-1 max-w-md mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="search"
                    placeholder="Search Q & Dashboard"
                    className="w-full py-2 pl-10 pr-4 border border-gray-200 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
            </div>

            {/* Right: Icons and User Profile */}
            <div className="flex-1 flex justify-end items-center space-x-4">
                
                {/* Notification Icon (Hover Effect) */}
                <button className="text-gray-500 hover:text-indigo-600 p-2 rounded-full transition duration-150 relative">
                    <Bell className="w-5 h-5" />
                    {/* Notification Dot */}
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                
                {/* Settings/Gear Icon */}
                <button className="text-gray-500 hover:text-indigo-600 p-2 rounded-full transition duration-150 hidden sm:block">
                    <Settings className="w-5 h-5" />
                </button>

                {/* User Profile (Avatar and Name) */}
                <div className="flex items-center space-x-2 border-l pl-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition duration-150">
                    <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">JS</div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:inline">John Smith</span>
                </div>
            </div>
        </header>
    )
};