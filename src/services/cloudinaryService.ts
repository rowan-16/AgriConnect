/**
 * Cloudinary Document & Image Storage Service
 * Handles uploading Land Documents, Crop Approval Documents, and Field Photos
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  bytes: number;
  format: string;
}

export const cloudinaryService = {
  /**
   * Upload a File or Data URL to Cloudinary
   */
  async uploadImage(file: File | string, folderName = 'farmer_verification'): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'agriconnect';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // If Cloudinary preset is configured, attempt real Cloudinary API post
    if (uploadPreset && file instanceof File) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', folderName);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data: CloudinaryUploadResponse = await response.json();
          return data.secure_url;
        }
      } catch (err) {
        console.warn('Cloudinary API upload failed, falling back to data URL:', err);
      }
    }

    // High-fidelity compressed Data URL generator for instant development previews & database storage
    if (file instanceof File) {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const rawUrl = event.target?.result as string;
          if (!rawUrl) return resolve('');

          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1200;
              const MAX_HEIGHT = 1200;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > MAX_WIDTH) {
                  height = Math.round((height * MAX_WIDTH) / width);
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width = Math.round((width * MAX_HEIGHT) / height);
                  height = MAX_HEIGHT;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);

              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
              resolve(compressedDataUrl);
            } catch {
              resolve(rawUrl);
            }
          };
          img.onerror = () => resolve(rawUrl);
          img.src = rawUrl;
        };
        reader.readAsDataURL(file);
      });
    }

    return file; // If string URL is passed directly
  }
};
