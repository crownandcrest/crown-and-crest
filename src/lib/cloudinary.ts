export const uploadToCloudinary = async (file: File) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary credentials missing in .env.local");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  // formData.append("folder", "Crowncrest/assets/products"); // Optional: Use this if you want the specific folder

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    // 👇 THIS IS THE NEW PART: Get the real error details
    const errorData = await response.json();
    console.error("🚨 Cloudinary Error Details:", errorData);
    throw new Error(errorData.error?.message || "Cloudinary upload failed");
  }

  const data = await response.json();
  return data.secure_url;
};