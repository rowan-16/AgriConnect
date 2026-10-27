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

    // High-fidelity fallback / direct data URL reader for instant development previews
    if (file instanceof File) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    }

    return file; // If string URL is passed directly
  }
};
