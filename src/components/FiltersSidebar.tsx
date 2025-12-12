"use client";
import React from "react";

export default function FiltersSidebar({ categories, onFilter }: { categories: string[], onFilter: (f:any)=>void }) {
  return (
    <aside className="w-full md:w-72 p-4 border rounded-xl bg-white">
      <div className="mb-4">
        <h4 className="font-medium">Filters</h4>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Category</div>
        <div className="flex flex-col gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => onFilter({ category: c })} className="text-left text-sm px-3 py-2 rounded hover:bg-neutral-50">{c}</button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Price</div>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" className="w-1/2 border px-2 py-1 rounded" />
          <input type="number" placeholder="Max" className="w-1/2 border px-2 py-1 rounded" />
        </div>
      </div>

      <button onClick={() => onFilter({ apply: true })} className="btn-primary w-full mt-2">Apply Filter</button>
    </aside>
  );
}
