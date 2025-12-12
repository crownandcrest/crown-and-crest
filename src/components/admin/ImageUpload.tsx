// src/components/admin/ImageUpload.tsx
"use client";

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Trash } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    value: string[];
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
    
    const onUpload = (result: any) => {
        onChange(result.info.secure_url);
    };

    return (
        <div>
            {/* 1. Preview */}
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-gray-200">
                        <div className="z-10 absolute top-2 right-2">
                            <button 
                                type="button" 
                                onClick={() => onRemove(url)}
                                className="bg-red-500 text-white p-1.5 rounded-md hover:bg-red-600 transition shadow-sm"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                        <Image fill className="object-cover" alt="Image" src={url} />
                    </div>
                ))}
            </div>

            {/* 2. Upload Button */}
            <CldUploadWidget 
                uploadPreset="crown_preset" // Ensure this matches your Cloudinary Settings name
                onSuccess={onUpload}
                options={{
                    maxFiles: 1,
                    folder: 'Crowncrest/assets/products', // 👈 DIRECT UPLOAD PATH
                    resourceType: 'image',
                    clientAllowedFormats: ['png', 'jpeg', 'jpg', 'webp'], // Optional safety
                }}
            >
                {({ open }) => {
                    return (
                        <button 
                            type="button" 
                            onClick={() => open()}
                            className="flex items-center gap-2 bg-gray-50 border-2 border-dashed border-gray-300 text-gray-600 px-6 py-4 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition w-full justify-center"
                        >
                            <ImagePlus className="w-5 h-5" />
                            <span className="font-medium">Click to Upload Image</span>
                        </button>
                    );
                }}
            </CldUploadWidget>
        </div>
    );
}