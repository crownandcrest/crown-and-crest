// src/types/global.d.ts
interface CloudinaryWidget {
  open: () => void;
  update: (options: object) => void;
  close: () => void;
  // Add other methods if needed
}

interface Cloudinary {
  createUploadWidget: (
    options: object,
    callback: (error: any, result: any) => void
  ) => CloudinaryWidget;
  // Add other Cloudinary methods if needed
}

interface Window {
  cloudinary: Cloudinary;
}
