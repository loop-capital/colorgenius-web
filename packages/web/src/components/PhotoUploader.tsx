'use client';

import { useState, useRef } from 'react';
import { Upload, Camera, X } from 'lucide-react';

interface PhotoUploaderProps {
  onPhotoSelected?: (file: File, preview: string) => void;
  onFileChange?: (f: File | null, p: string | null) => void;
  currentPhoto?: string;
  photoType?: 'current' | 'target';
  onPhotoTypeChange?: (type: 'current' | 'target') => void;
  disabled?: boolean;
}

export default function PhotoUploader({
  onPhotoSelected,
  onFileChange,
  currentPhoto,
  photoType,
  onPhotoTypeChange,
  disabled,
}: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreview(result);
      if (onPhotoSelected) onPhotoSelected(file, result);
      if (onFileChange) onFileChange(file, result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearPhoto = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src={preview}
            alt="Hair preview"
            className="w-full h-80 object-cover"
          />
          <button
            onClick={clearPhoto}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white text-sm font-medium">Hair photo ready for analysis</p>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
            ${isDragging
              ? 'border-gold-500 bg-gold-50'
              : 'border-cream-300 bg-cream-50 hover:border-gold-400 hover:bg-gold-50'
            }
          `}
          style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-cream-200 rounded-full">
              <Upload className="w-8 h-8 text-cream-700" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-800">Upload Hair Photo</p>
              <p className="text-sm text-gray-500 mt-1">Drag & drop or click to browse</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Camera className="w-4 h-4" />
              <span>PNG, JPG, WebP up to 20MB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
