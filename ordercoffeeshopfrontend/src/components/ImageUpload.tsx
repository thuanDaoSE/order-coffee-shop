import React from 'react';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onFileSelect, isUploading }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // You can add file type and size validation here if needed

    onFileSelect(file);
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
        {isUploading ? 'Uploading...' : 'Choose Image'}
      </label>
    </div>
  );
};

export default ImageUpload;