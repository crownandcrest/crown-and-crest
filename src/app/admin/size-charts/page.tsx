"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash, Save, Loader2 } from "lucide-react";

export default function SizeChartManager() {
    const supabase = createClient();
    const [charts, setCharts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [rows, setRows] = useState([{ size: "S", chest: 40, shoulder: 18, length: 27 }]);

    useEffect(() => {
        fetchCharts();
    }, []);

    const fetchCharts = async () => {
        const { data } = await supabase.from('size_charts').select('*');
        if (data) setCharts(data);
        setLoading(false);
    };

    const handleAddRow = () => {
        setRows([...rows, { size: "", chest: 0, shoulder: 0, length: 0 }]);
    };

    const handleRowChange = (index: number, field: string, value: string | number) => {
        const newRows = [...rows];
        // @ts-ignore
        newRows[index][field] = value;
        setRows(newRows);
    };

    const handleSave = async () => {
        if (!newName) return alert("Please enter a name");

        // Convert Array to Object for JSONB storage
        const measurementsObject = rows.reduce((acc: any, row) => {
            if (row.size) {
                acc[row.size] = {
                    chest: Number(row.chest),
                    shoulder: Number(row.shoulder),
                    length: Number(row.length)
                };
            }
            return acc;
        }, {});

        const { error } = await supabase.from('size_charts').insert({
            name: newName,
            measurements: measurementsObject
        });

        if (error) alert(error.message);
        else {
            setIsCreating(false);
            setNewName("");
            fetchCharts();
        }
    };

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Size Charts (Admin)</h1>
                <button 
                    onClick={() => setIsCreating(true)} 
                    className="bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Create New Profile
                </button>
            </div>

            {/* CREATION FORM */}
            {isCreating && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg mb-8 animate-in fade-in">
                    <h3 className="font-bold mb-4">New Size Guide</h3>
                    <div className="mb-4">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Profile Name</label>
                        <input 
                            placeholder="e.g. Oversized Hoodie Fit" 
                            className="w-full p-2 border rounded"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>

                    <div className="border rounded-lg overflow-hidden mb-4">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 font-bold">
                                <tr>
                                    <th className="p-3">Size Label</th>
                                    <th className="p-3">Chest (in)</th>
                                    <th className="p-3">Shoulder (in)</th>
                                    <th className="p-3">Length (in)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="p-2"><input className="w-16 p-1 border rounded" value={row.size} onChange={(e) => handleRowChange(idx, 'size', e.target.value)} placeholder="S" /></td>
                                        <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={row.chest} onChange={(e) => handleRowChange(idx, 'chest', e.target.value)} /></td>
                                        <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={row.shoulder} onChange={(e) => handleRowChange(idx, 'shoulder', e.target.value)} /></td>
                                        <td className="p-2"><input type="number" className="w-full p-1 border rounded" value={row.length} onChange={(e) => handleRowChange(idx, 'length', e.target.value)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex gap-2">
                        <button onClick={handleAddRow} className="text-xs font-bold text-indigo-600 hover:underline">+ Add Size Row</button>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-500 hover:text-black">Cancel</button>
                        <button onClick={handleSave} className="bg-black text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2">
                            <Save className="w-4 h-4" /> Save Profile
                        </button>
                    </div>
                </div>
            )}

            {/* LIST */}
            <div className="grid gap-4">
                {charts.map((chart) => (
                    <div key={chart.id} className="bg-white p-4 border rounded-xl flex justify-between items-center">
                        <div>
                            <h3 className="font-bold">{chart.name}</h3>
                            <p className="text-xs text-gray-500">{Object.keys(chart.measurements).join(', ')}</p>
                        </div>
                        <button className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash className="w-4 h-4" /></button>
                    </div>
                ))}
            </div>
        </div>
    );
}
