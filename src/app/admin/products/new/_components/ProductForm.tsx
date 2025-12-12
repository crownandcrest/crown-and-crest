'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <-- Import useRouter for redirection
import { Image, X, Upload } from 'lucide-react';
import { createProductAction } from '@/actions/product'; // <-- Import the Server Action

// Define the type for the image object returned by Cloudinary
type CloudinaryImage = {
  secure_url: string;
  public_id: string;
};

// Function to load the Cloudinary script only once
const loadCloudinaryScript = () => {
  // Ensure this runs only on the client side
  if (typeof document !== 'undefined' && !document.getElementById('cloudinary-upload-widget')) {
    const script = document.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('id', 'cloudinary-upload-widget');
    script.src = 'https://widget.cloudinary.com/v2.0/global/widget.js';
    document.body.appendChild(script);
  }
};

export default function ProductForm() {
  const router = useRouter(); // Initialize router for navigation
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the script when the component mounts
  useEffect(() => {
    loadCloudinaryScript();
  }, []);

  // --- CLOUDINARY WIDGET HANDLER ---
  const openWidget = () => {
    if (typeof window.cloudinary !== 'undefined') {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
          uploadPreset: 'your_upload_preset', // <--- MAKE SURE THIS IS UPDATED
          sources: ['local', 'url', 'camera'],
          multiple: true,
          maxImageFileSize: 5000000, // 5MB limit
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        },
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            const newImage: CloudinaryImage = {
              secure_url: result.info.secure_url,
              public_id: result.info.public_id,
            };
            setImages((prev) => [...prev, newImage]);
            setError(null); // Clear errors on successful upload
          }
        }
      );
      widget.open();
    } else {
      alert('Cloudinary Widget is not yet loaded. Please wait a moment.');
    }
  };

  const removeImage = (publicId: string) => {
    setImages(images.filter(img => img.public_id !== publicId));
    // NOTE: In a real app, you might add logic here to delete the image from Cloudinary itself.
  };

  // --- FORM SUBMISSION HANDLER (Uses Server Action) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    // 1. Prepare data for the Server Action
    const productData = {
      name,
      price: parseFloat(price.toFixed(2)),
      stock_quantity: parseInt(stock.toString()),
      images: images.map(img => img.secure_url), 
    };
    
    // 2. Call the Server Action
    const result = await createProductAction(productData); 

    if (result.success) {
        // Success: Clear form and redirect
        alert(`Product "${name}" created successfully!`);
        router.push('/admin/products');
    } else {
        // Error: Show message to user
        setError(result.message || 'An unknown error occurred during creation.');
        setIsSubmitting(false); // Allow user to try again
    }
  };


  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Input */}
        <label className="block">
          <span className="text-gray-700 font-medium">Product Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-10 px-3"
            required
            disabled={isSubmitting}
          />
        </label>
        
        {/* Price Input */}
        <label className="block">
          <span className="text-gray-700 font-medium">Price ($)</span>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-10 px-3"
            required
            disabled={isSubmitting}
          />
        </label>

        {/* Stock Input */}
        <label className="block col-span-1 md:col-span-2">
          <span className="text-gray-700 font-medium">Stock Quantity</span>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-10 px-3"
            required
            disabled={isSubmitting}
          />
        </label>
      </div>

      {/* --- Cloudinary Image Upload Area --- */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
            <Image className="w-5 h-5" />
            <span>Product Images ({images.length} uploaded)</span>
        </h3>
        
        <button
            type="button"
            onClick={openWidget}
            disabled={isSubmitting}
            className="flex items-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 border border-dashed border-gray-400 rounded-lg hover:bg-gray-200 transition duration-150 mb-4"
        >
            <Upload className="w-5 h-5" />
            <span>Upload Image via Cloudinary Widget</span>
        </button>

        {/* Display Uploaded Images */}
        <div className="flex flex-wrap gap-4 mt-4">
          {images.map((img) => (
            <div key={img.public_id} className="relative w-32 h-32 border rounded-lg overflow-hidden shadow-md">
              <img 
                src={img.secure_url} 
                alt="Product Preview" 
                className="w-full h-full object-cover" 
              />
              <button
                type="button"
                onClick={() => removeImage(img.public_id)}
                className="absolute top-1 right-1 bg-red-500 p-1 rounded-full text-white hover:bg-red-600 transition"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              Error: {error}
          </div>
      )}

      {/* Submission Button */}
      <button
        type="submit"
        disabled={isSubmitting || images.length === 0}
        className={`w-full py-3 rounded-lg text-white font-bold transition-colors duration-200 ${
          isSubmitting || images.length === 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isSubmitting ? 'Saving Product...' : 'Create Product'}
      </button>
      
      {images.length === 0 && (
          <p className="text-sm text-red-500 text-center">
            You must upload at least one image before submitting.
          </p>
      )}
    </form>
  );
}