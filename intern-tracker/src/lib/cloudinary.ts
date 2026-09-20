
/**
 * Uploads a file directly from the browser to Cloudinary
 * using an unsigned upload preset.
 *
 * Required environment variables:
 * VITE_CLOUDINARY_CLOUD_NAME
 * VITE_CLOUDINARY_UPLOAD_PRESET
 */

export interface CloudinaryUploadResult {
  url: string;
  originalFileName: string;
  publicId?: string;
  resourceType?: string;
}

export async function uploadToCloudinary(
  file: File,
  folder: string
): Promise<CloudinaryUploadResult> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.'
    );
  }

  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  // The auto resource type supports multiple file formats.
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(`Cloudinary upload failed: ${body}`);
  }

  const data = await response.json();

  return {
    url: data.secure_url as string,
    originalFileName: file.name,
    publicId: data.public_id as string | undefined,
    resourceType: data.resource_type as string | undefined,
  };
}