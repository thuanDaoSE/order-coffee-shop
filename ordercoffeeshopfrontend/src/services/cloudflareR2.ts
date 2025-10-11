export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

// Load configuration from environment variables
const r2Config: R2Config = {
  accountId: import.meta.env.VITE_R2_ACCOUNT_ID,
  accessKeyId: import.meta.env.VITE_R2_ACCESS_KEY,
  secretAccessKey: import.meta.env.VITE_R2_SECRET_KEY,
  bucketName: import.meta.env.VITE_R2_BUCKET_NAME,
  publicUrl: import.meta.env.VITE_R2_PUBLIC_URL
};

interface SignedUrlOptions {
  expiresIn?: number; // Expiration time in seconds
  contentType?: string;
}

export async function getSignedImageUrl(objectKey: string): Promise<string> {
  try {
    const response = await fetch(`/api/signed-url?key=${encodeURIComponent(objectKey)}`);
    if (!response.ok) {
      throw new Error('Failed to get signed URL');
    }
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
}

export async function uploadImageToR2(
  file: File,
  options: SignedUrlOptions = {}
): Promise<string> {
  try {
    // Get a pre-signed URL for upload
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const response = await fetch('/api/upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName,
        contentType: file.type || 'application/octet-stream',
        ...options,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { url, key } = await response.json();

    // Upload the file using the pre-signed URL
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    return key;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
}

export function getPublicUrl(objectKey: string): string {
  return `${r2Config.publicUrl}/${objectKey}`;
}

export default {
  getSignedImageUrl,
  uploadImageToR2,
  getPublicUrl,
};