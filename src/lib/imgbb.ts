// ImgBB API integration for image uploads
// Cloudinary integration for PDF uploads

export async function uploadImageToImgBB(file: File): Promise<string> {
  // If PDF, use Cloudinary
  if (file.type === 'application/pdf') {
    return uploadToCloudinary(file);
  }

  // For images, use ImgBB
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
  
  if (!apiKey) {
    console.warn('ImgBB API key not configured, using demo mode');
    // Fallback to demo mode
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = `https://i.imgur.com/${Math.random().toString(36).substring(7)}.jpg`;
        resolve(mockUrl);
      }, 1000);
    });
  }

  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to upload image to ImgBB');
    }

    return data.data.url;
  } catch (error) {
    console.error('ImgBB upload error:', error);
    throw new Error('Failed to upload image to ImgBB');
  }
}

async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    console.warn('Cloudinary not configured, using demo mode');
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUrl = `https://example.com/pdf/${Math.random().toString(36).substring(7)}.pdf`;
        resolve(mockUrl);
      }, 1000);
    });
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('resource_type', 'raw');
  formData.append('public_id', `delivery_${Date.now()}`);
  formData.append('folder', 'delivery_bills');

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('Cloudinary error:', data.error);
      throw new Error(data.error.message);
    }

    // Use the secure_url from response, which should be the correct raw URL
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload PDF to Cloudinary');
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, WebP, or PDF.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit.' };
  }

  return { valid: true };
}
