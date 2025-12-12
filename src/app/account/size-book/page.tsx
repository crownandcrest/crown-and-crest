"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Ruler, Plus, Trash2, CheckCircle, Save, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

export default function SizeBookPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState<any[]>([]);
    
    // Form State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: "",
        profile_name: "",
        chest: "",
        shoulder: "",
        length: "",
        is_default: false
    });

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }

        const { data } = await supabase
            .from('user_measurements')
            .select('*')
            .eq('user_id', user.id)
            .order('is_default', { ascending: false }); // Default first

        if (data) setProfiles(data);
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const payload = {
            user_id: user.id,
            profile_name: formData.profile_name,
            chest: Number(formData.chest),
            shoulder: Number(formData.shoulder),
            length: Number(formData.length),
            is_default: formData.is_default
        };

        // Logic: If setting as default, uncheck others
        if (formData.is_default) {
            await supabase.from('user_measurements').update({ is_default: false }).eq('user_id', user.id);
        }

        let error;
        if (formData.id) {
            // Update existing
            const { error: err } = await supabase.from('user_measurements').update(payload).eq('id', formData.id);
            error = err;
        } else {
            // Insert new
            const { error: err } = await supabase.from('user_measurements').insert(payload);
            error = err;
        }

        if (error) {
            alert("Error saving: " + error.message);
        } else {
            setIsEditing(false);
            resetForm();
            fetchProfiles();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this profile?")) return;
        await supabase.from('user_measurements').delete().eq('id', id);
        fetchProfiles();
    };

    const editProfile = (profile: any) => {
        setFormData({
            id: profile.id,
            profile_name: profile.profile_name,
            chest: profile.chest,
            shoulder: profile.shoulder,
            length: profile.length,
            is_default: profile.is_default
        });
        setIsEditing(true);
    };

    const resetForm = () => {
        setFormData({ id: "", profile_name: "", chest: "", shoulder: "", length: "", is_default: false });
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-6">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black uppercase">My Size Book</h1>
                    <p className="text-gray-500">Save your measurements for smart size recommendations.</p>
                </div>
            </div>

            {!isEditing ? (
                // LIST VIEW
                <div className="space-y-6">
                    <button 
                        onClick={() => { resetForm(); setIsEditing(true); }}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center gap-2 text-gray-500 font-bold hover:border-black hover:text-black transition"
                    >
                        <Plus className="w-5 h-5" /> Add New Profile
                    </button>

                    <div className="grid gap-4">
                        {profiles.map((profile) => (
                            <div key={profile.id} className={`p-6 bg-white border rounded-2xl flex justify-between items-center ${profile.is_default ? 'border-black ring-1 ring-black' : 'border-gray-200'}`}>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-bold text-lg">{profile.profile_name}</h3>
                                        {profile.is_default && <span className="bg-black text-white text-[10px] px-2 py-1 rounded-full uppercase font-bold">Default</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 flex gap-4">
                                        <span>Chest: {profile.chest}"</span>
                                        <span>Shoulder: {profile.shoulder}"</span>
                                        <span>Length: {profile.length}"</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => editProfile(profile)} className="px-4 py-2 text-sm font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Edit</button>
                                    <button onClick={() => handleDelete(profile.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {profiles.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700 text-sm mt-8">
                            <Info className="w-5 h-5 flex-shrink-0" />
                            <p>
                                <strong>Tip:</strong> We will automatically compare your "Default" profile with our product size charts to recommend your best fit.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                // EDIT/CREATE FORM
                <form onSubmit={handleSave} className="bg-white border border-gray-200 p-8 rounded-2xl shadow-sm animate-in slide-in-from-bottom-4">
                    <h3 className="font-bold text-xl mb-6">{formData.id ? "Edit Profile" : "New Measurement Profile"}</h3>
                    
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Profile Name</label>
                            <input 
                                required 
                                placeholder="e.g. My Loose Fit, Dad's Fit" 
                                className="w-full p-3 border border-gray-200 rounded-xl"
                                value={formData.profile_name}
                                onChange={e => setFormData({...formData, profile_name: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Chest (in)</label>
                                <input type="number" required className="w-full p-3 border border-gray-200 rounded-xl" value={formData.chest} onChange={e => setFormData({...formData, chest: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Shoulder (in)</label>
                                <input type="number" required className="w-full p-3 border border-gray-200 rounded-xl" value={formData.shoulder} onChange={e => setFormData({...formData, shoulder: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Length (in)</label>
                                <input type="number" required className="w-full p-3 border border-gray-200 rounded-xl" value={formData.length} onChange={e => setFormData({...formData, length: e.target.value})} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input 
                                type="checkbox" 
                                id="is_def" 
                                className="w-5 h-5 accent-black"
                                checked={formData.is_default}
                                onChange={e => setFormData({...formData, is_default: e.target.checked})}
                            />
                            <label htmlFor="is_def" className="font-bold text-sm cursor-pointer">Set as Default Profile</label>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-50 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" /> Save Profile
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}