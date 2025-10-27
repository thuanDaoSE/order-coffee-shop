import React, { useState } from 'react';
import { uploadImageToR2 } from '../services/cloudflareR2';

interface ImageUploadProps {
  onUploadSuccess: (key: string) => void;
  onUploadError: (error: Error) => void;
  onUploadStateChange?: (isUploading: boolean) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, onUploadError, onUploadStateChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      onUploadStateChange?.(true);
      setProgress(0);

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }

      const key = await uploadImageToR2(file);
      onUploadSuccess(key);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError(error as Error);
    } finally {
      setIsUploading(false);
      onUploadStateChange?.(false);
      setProgress(0);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className={`inline-block px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition-colors
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isUploading ? 'Uploading...' : 'Upload Image'}
      </label>
      {isUploading && progress > 0 && (
        <div className="w-full h-2 bg-gray-200 rounded mt-2">
          <div
            className="h-full bg-blue-500 rounded transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;